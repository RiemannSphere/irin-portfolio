export function createSessionLikedObjectsKey(sessionId: string): string {
    return `likedObjects:session:${sessionId}`;
}

export function getObjectKey(objectType: string, objectId: string): string {
    return `${objectType}:${objectId}`;
}

export function createObjectLikesKey(objectType: string, objectId: string): string {
    return `likes:${getObjectKey(objectType, objectId)}`;
}