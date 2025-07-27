import { getCookie, setCookie, type SessionCookie } from "../utils/cookies.ts";
import type { Session } from "../types";
import { createSessionKey, createVisitKey } from "../utils/kv.ts";

export async function handleGetSession(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const sessionId = getCookie<SessionCookie>(request, 'sessionId');

    const foundSession = sessionId ? await env['irin-portfolio'].get(createSessionKey(sessionId)) : null;

    if (!sessionId || !foundSession) {
        const newSessionId = crypto.randomUUID();
        const response = new Response(null);

        setCookie(response, 'sessionId', newSessionId);
        
        const cf = request.cf as IncomingRequestCfProperties | undefined;
        const session: Session = cf ? {
            sessionId: newSessionId,
            createdAt: new Date().toISOString(),
            asn: cf.asn,
            country: cf.country,
            city: cf.city,
            latitude: cf.latitude,
            longitude: cf.longitude,
            postalCode: cf.postalCode,
            metroCode: cf.metroCode,
            region: cf.region,
            timezone: cf.timezone,
        } : {
            sessionId: newSessionId,
            createdAt: new Date().toISOString(),
        };
        await env['irin-portfolio'].put(createSessionKey(newSessionId), JSON.stringify(session));
        await env['irin-portfolio'].put(createVisitKey(newSessionId), new Date().toISOString());
        
        return new Response('New session created', { status: 200, headers: response.headers });
    }

    await env['irin-portfolio'].put(createVisitKey(sessionId), new Date().toISOString());

    return new Response('Session already exists', { status: 200 });
}