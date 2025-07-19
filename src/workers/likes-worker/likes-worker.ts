import { getCookie, type SessionCookie } from "../../utils/cookies";
import { createSessionLikedObjectsKey, getObjectKey } from "../../utils/kv";
import type { LikesRequest } from "./likes-request.type";
import { LikesRequestSchema } from "./likes-request.type";

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        const sessionId = getCookie<SessionCookie>(request, 'sessionId');

        if (!sessionId) {
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

        if (isObjectLiked) {
            return new Response(`Object ${objectKey} is already liked`, { status: 400 });
        }
        
        const likesCount = parseInt(await env['irin-portfolio'].get(objectKey) ?? '0');

        const newLikesCount = likeType === 'like' 
            ? likesCount + 1 
            : likesCount - 1;

        if (newLikesCount < 0) {
            return new Response(`Likes count cannot be negative`, { status: 400 });
        }

        await env['irin-portfolio'].put(objectKey, newLikesCount.toString());
        await env['irin-portfolio'].put(sessionLikedObjectsKey, JSON.stringify([...sessionLikedObjects, objectKey]));

        return new Response(`Likes updated for ${objectType} ${objectId}`, { status: 200 });
    } 
} satisfies ExportedHandler<Env>;