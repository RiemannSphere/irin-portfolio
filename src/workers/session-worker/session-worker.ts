import { getCookie, type SessionCookie } from "../../utils/cookies";
import type { LikesRequest } from "./likes-request.type";
import { LikesRequestSchema } from "./likes-request.type";

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        if (request.method !== 'GET') {
            return new Response('Method not allowed', { status: 405 });
        }
        
        const sessionId = getCookie<SessionCookie>(request, 'sessionId');

        if (!sessionId) {
            return new Response('Unauthorized', { status: 401 });
        }
        
        

        return new Response(`Likes updated for ${objectType} ${objectId}`, { status: 200 });
    } 
} satisfies ExportedHandler<Env>;