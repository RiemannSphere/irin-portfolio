import { handleGetLikes, handleGetLikesCounts, handleLike } from "./api/likes-api";
import { handleGetSession } from "./api/session-api";
import { addCorsHeaders, handleOptionsRequest } from "./utils/cors.ts";
import { handleClearKV, handleGetKV } from "./api/debug-api.ts";


export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle preflight OPTIONS requests for CORS
        if (request.method === 'OPTIONS') {
            return handleOptionsRequest();
        }

        if (path === '/api/debug/kv') {
            return handleGetKV(request, env);
        }

        if (path === '/api/debug/kv/clear') {
            return handleClearKV(request, env);
        }

        if (path === '/api/session') {
            const response = await handleGetSession(request, env);
            return addCorsHeaders(response);
        }
        
        if (path === '/api/likes') {
            const response = await handleGetLikes(request, env);
            return addCorsHeaders(response);
        }

        if (path === '/api/like') {
            const response = await handleLike(request, env);
            return addCorsHeaders(response);
        }

        // "/api/likes/counts/{objectType}"
        if (path.startsWith('/api/likes/counts/')) {
            const objectType = path.split('/')[4];
            const response = await handleGetLikesCounts(request, env, objectType);
            return addCorsHeaders(response);
        }

        return addCorsHeaders(new Response('Not found', { status: 404 }));
    } 
} satisfies ExportedHandler<Env>;