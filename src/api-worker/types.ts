import { z } from 'zod';

export type Session = {
    sessionId: string;
    createdAt: string;
    asn?: number;
    country?: string;
    city?: string;
    latitude?: string;
    longitude?: string;
    postalCode?: string;
    metroCode?: string;
    region?: string;
    timezone?: string;
}

export type LikesRequest = {
    objectType: 'artwork';
    objectId: string;
    likeType: 'like' | 'unlike';
}

export const LikesRequestSchema = z.object({
    objectType: z.literal('artwork'),
    objectId: z.string(),
    likeType: z.enum(['like', 'unlike'])
});