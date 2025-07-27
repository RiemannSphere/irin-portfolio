import { LIKED_OBJECTS_SESSION, LIKES_COUNT, SESSION, VISIT_SESSION } from "./const.ts";

export function createSessionLikedObjectsKey(sessionId: string): string {
    return `${LIKED_OBJECTS_SESSION}:${sessionId}`;
}

export function getObjectKey(objectType: string, objectId: string): string {
    return `${objectType}:${objectId}`;
}

export function createObjectLikesKey(objectType: string, objectId: string): string {
    return `${LIKES_COUNT}:${getObjectKey(objectType, objectId)}`;
}

export function createSessionKey(sessionId: string): string {
    return `${SESSION}:${sessionId}`;
}

export function createVisitKey(sessionId: string): string {
    return `${VISIT_SESSION}:${sessionId}`;
}