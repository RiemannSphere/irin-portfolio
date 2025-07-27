import { createObjectLikesKey, createSessionKey, createSessionLikedObjectsKey, getObjectKey } from "../utils/kv.ts";
import type { LikesRequest } from "../types.ts";
import { LikesRequestSchema } from "../types.ts";
import { getCookie, type SessionCookie } from "../utils/cookies.ts";
import { LIKES_COUNT } from "../utils/const.ts";

export async function handleGetLikes(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const sessionId = getCookie<SessionCookie>(request, 'sessionId');

    if (!sessionId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const foundSession = await env['irin-portfolio'].get(createSessionKey(sessionId));

    if (!foundSession) {
        return new Response('Unauthorized', { status: 401 });
    }

    const sessionLikedObjectsKey = createSessionLikedObjectsKey(sessionId);
    const sessionLikedObjects = JSON.parse(await env['irin-portfolio'].get(sessionLikedObjectsKey) ?? "[]");

    return new Response(JSON.stringify(sessionLikedObjects), { status: 200 });
}

export async function handleGetLikesCounts(request: Request, env: Env, objectType: string): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    const sessionId = getCookie<SessionCookie>(request, 'sessionId');

    if (!sessionId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const foundSession = await env['irin-portfolio'].get(createSessionKey(sessionId));

    if (!foundSession) {
        return new Response('Unauthorized', { status: 401 });
    }
    
    const likesCountKeys = await env['irin-portfolio'].list({ prefix: `${LIKES_COUNT}:${objectType}:` });
    
    const likesCounts: Record<string, number> = {};
    
    for (const key of likesCountKeys.keys) {
        const count = await env['irin-portfolio'].get(key.name);
        if (count) {
            const objectId = key.name.replace(`${LIKES_COUNT}:`, '');
            likesCounts[objectId] = parseInt(count);
        }
    }

    return new Response(JSON.stringify(likesCounts), { status: 200 });
}   

export async function handleLike(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const sessionId = getCookie<SessionCookie>(request, 'sessionId');

    if (!sessionId) {
        return new Response('Unauthorized', { status: 401 });
    }

    const foundSession = await env['irin-portfolio'].get(createSessionKey(sessionId));

    if (!foundSession) {
        return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json<LikesRequest>().catch(() => null);
    
    if (!body) {
        return new Response("Invalid JSON in request body", { status: 400 });
    }
    
    const validationResult = LikesRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
        return new Response(`Invalid request body: ${validationResult.error.message}`, { status: 400 });
    }
    
    const { objectType, objectId, likeType } = validationResult.data;

    const objectKey = getObjectKey(objectType, objectId);
    const sessionLikedObjectsKey = createSessionLikedObjectsKey(sessionId);
    const sessionLikedObjects = JSON.parse(await env['irin-portfolio'].get(sessionLikedObjectsKey) ?? "[]");
    const isObjectLiked = sessionLikedObjects.includes(objectKey);

    if (isObjectLiked && likeType === 'like') {
        return new Response(`Cannot like. Object ${objectKey} is already liked`, { status: 400 });
    }

    if (!isObjectLiked && likeType === 'unlike') {
        return new Response(`Cannot unlike. Object ${objectKey} is not liked`, { status: 400 });
    }

    const objectLikesKey = createObjectLikesKey(objectType, objectId);

    const likesCount = parseInt(await env['irin-portfolio'].get(objectLikesKey) ?? '0');

    if (likeType === 'like') {        
        const newLikesCount = likesCount + 1;
        await env['irin-portfolio'].put(objectLikesKey, newLikesCount.toString());
        const updatedSessionLikedObjects = new Set([...sessionLikedObjects, objectKey]);
        await env['irin-portfolio'].put(sessionLikedObjectsKey, JSON.stringify(Array.from(updatedSessionLikedObjects)));    
    }
    
    if (likeType === 'unlike') {
        const newLikesCount = likesCount - 1;
        await env['irin-portfolio'].put(objectLikesKey, newLikesCount.toString());
        const updatedSessionLikedObjects = new Set(sessionLikedObjects.filter((key: string) => key !== objectKey));
        await env['irin-portfolio'].put(sessionLikedObjectsKey, JSON.stringify(Array.from(updatedSessionLikedObjects)));
    }

    return new Response(`Likes updated for ${objectType} ${objectId}`, { status: 200 });
}
