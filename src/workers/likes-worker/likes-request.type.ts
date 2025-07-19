import { z } from 'zod';

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

export type LikesRequestValidated = z.infer<typeof LikesRequestSchema>;