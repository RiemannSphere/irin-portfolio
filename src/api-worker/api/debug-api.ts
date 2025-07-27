export async function handleGetKV(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const list = await env['irin-portfolio'].list();
    const keys = list.keys;

    const data: Record<string, string | null> = {};
    for (const key of keys) {
        data[key.name] = await env['irin-portfolio'].get(key.name);
    }

    return new Response(JSON.stringify(data, null, 2), {
        headers: { 'Content-Type': 'application/json' },
    });
}

export async function handleClearKV(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET') {
        return new Response('Method not allowed', { status: 405 });
    }

    const list = await env['irin-portfolio'].list();
    for (const key of list.keys) {
        await env['irin-portfolio'].delete(key.name);
    }

    return new Response("KV cleared");
}