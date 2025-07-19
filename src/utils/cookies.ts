export type CookieName = 'sessionId' | 'likedObjectIds';

export type SessionCookie = {
    sessionId: string;
}

export type LikesCookie = {
    likedObjectIds: string[];
}

type Cookie = SessionCookie | LikesCookie;

function getCookieHeader(request: Request): string | null {
    return request.headers.get("Cookie");
}

function getCookies(request: Request): string[] {
    const cookieHeader = getCookieHeader(request);
    if (!cookieHeader) {
        return [];
    }

    return cookieHeader.split(";").map(c => c.trim());
}

function getCookieValue<T extends Cookie>(cookie: string, name: keyof T): T[keyof T] | null {
    const [key, value] = cookie.split("=");
    if (key === name) {
        return value as T[keyof T];
    }
    
    return null;
}

export function getCookie<T extends Cookie>(request: Request, name: keyof T): T[keyof T] | null {
    const cookies: string[] = getCookies(request);
    for (const cookie of cookies) {
        const value = getCookieValue(cookie, name);
        if (value) {
            return value;
        }
    }

    return null;
}

function setCookie<T extends Cookie>(response: Response, name: keyof T, value: T[keyof T]): void {
    const parts = [`${String(name)}=${String(value)}`];
    parts.push("Path=/");
    parts.push("HttpOnly");
    parts.push("SameSite=Lax");
    parts.push("Secure");

    response.headers.append("Set-Cookie", parts.join("; "));
}
