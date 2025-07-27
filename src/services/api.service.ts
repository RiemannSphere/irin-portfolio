/**
 * Creates a new session and sets the sessionId cookie.
 * If the sessionId cookie is already set, it will not create a new session.
 * All the future requests will have the sessionId cookie set.
 */
export function getSession(): Promise<void> {
    return fetch('http://localhost:8787/api/session', {
        credentials: 'include'
    }).then(() => {});
}

/**
 * Gets the likes for the current session.
 */
export function getLikes(): Promise<string[]> {
    return fetch('http://localhost:8787/api/likes', {
        credentials: 'include'
    }).then(res => res.json()).then(data => Array.isArray(data) ? data : []);
}

/**
 * Gets the likes counts for every object of the given type for the current session.
 */
export function getLikesCounts(objectType: string): Promise<Record<string, number>> {
    return fetch(`http://localhost:8787/api/likes/counts/${objectType}`, {
        credentials: 'include'
    }).then(res => res.json()).then(data => data as Record<string, number>);
}

/**
 * Likes an object for the current session.
 * Does not allow liking the same object twice.
 */
export function like(galleryItemId: string): Promise<void> {
    const [objectType, objectId] = galleryItemId.split(':');

    return fetch('http://localhost:8787/api/like', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ objectType, objectId, likeType: 'like' }),
    }).then(() => {});
}

/**
 * Unlikes an object for the current session.
 * Does not allow unliking an object that is not liked.
 */
export function unlike(galleryItemId: string): Promise<void> {
    const [objectType, objectId] = galleryItemId.split(':');

    return fetch('http://localhost:8787/api/like', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ objectType, objectId, likeType: 'unlike' }),
    }).then(() => {});
}