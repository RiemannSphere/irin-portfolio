export function addCorsHeaders(response: Response): Response {
    const headers = new Headers(response.headers);
    
    // Allow requests from localhost during development
    headers.set('Access-Control-Allow-Origin', 'http://localhost:4321');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie, Set-Cookie');
    headers.set('Access-Control-Allow-Credentials', 'true');
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}

export function handleOptionsRequest(): Response {
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', 'http://localhost:4321');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Cookie, Set-Cookie');
    headers.set('Access-Control-Allow-Credentials', 'true');
    
    return new Response(null, { status: 200, headers });
} 