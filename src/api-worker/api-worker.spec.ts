import apiWorker from './main';

const mockRandomUUID = jest.fn();
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: mockRandomUUID,
    },
    writable: true,
});

describe('API Worker', () => {
    const mockSessionUrl = 'http://localhost:8787/api/session';
    const mockLikesUrl = 'http://localhost:8787/api/likes';
    const mockLikeUrl = 'http://localhost:8787/api/like';
    let mockEnv: Env;
    let mockKVStore: Record<string, string>;

    beforeEach(() => {
        mockKVStore = {};
        mockEnv = {
            'irin-portfolio': {
                get: (key: string) => {
                    return mockKVStore[key];
                },
                put: (key: string, value: string) => {
                    mockKVStore[key] = value;
                },
            } as unknown as KVNamespace,
        }
        mockRandomUUID.mockClear();
    });
    
    it('should create a new session if no sessionId is provided in the cookie', async () => {
        mockRandomUUID.mockReturnValue('test-session-id-123');
        
        const mockRequest = new Request(mockSessionUrl, {
            method: 'GET',
            headers: {
                'Cookie': 'sessionId=; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const result = await apiWorker.fetch(mockRequest, mockEnv);

        expect(result.status).toBe(200);
        expect(result.headers.get('Set-Cookie')).toContain('sessionId=test-session-id-123');
        expect(mockRandomUUID).toHaveBeenCalledTimes(1);
        expect(mockKVStore['session:test-session-id-123']).toBeDefined();
        expect(mockKVStore['visit:session:test-session-id-123']).toBeDefined();
    });

    it('should create a new session if the unknown sessionId is provided', async () => {
        mockRandomUUID.mockReturnValue('test-session-id-456');
        const mockRequest = new Request(mockSessionUrl, {
            method: 'GET',
            headers: {
                'Cookie': 'sessionId=non-existent-session-id; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const result = await apiWorker.fetch(mockRequest, mockEnv);
        expect(result.status).toBe(200);
        expect(result.headers.get('Set-Cookie')).toContain('sessionId=test-session-id-456');
        expect(mockRandomUUID).toHaveBeenCalledTimes(1);
        expect(mockKVStore['session:test-session-id-456']).toBeDefined();
        expect(mockKVStore['visit:session:test-session-id-456']).toBeDefined();
    });

    it('should like the right object for the right session', async () => {
        mockKVStore['session:test-session-id-123'] = '{"sessionId":"test-session-id-123","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['session:test-session-id-456'] = '{"sessionId":"test-session-id-456","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['liked-objects:session:test-session-id-123'] = '["artwork:1"]';
        mockKVStore['liked-objects:session:test-session-id-456'] = '["artwork:2"]';
        mockKVStore['likes-count:artwork:1'] = '1';
        mockKVStore['likes-count:artwork:2'] = '1';
        mockKVStore['likes-count:artwork:100'] = '0';

        const mockLikeRequest = new Request(mockLikeUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'like',
            }),
            headers: {
                'Cookie': 'sessionId=test-session-id-123; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const likeResult = await apiWorker.fetch(mockLikeRequest, mockEnv);

        expect(likeResult.status).toBe(200);
        expect(likeResult.text()).resolves.toBe('Likes updated for artwork 100');
        expect(mockKVStore['likes-count:artwork:1']).toBe('1');
        expect(mockKVStore['likes-count:artwork:2']).toBe('1');
        expect(mockKVStore['likes-count:artwork:100']).toBe('1');
        expect(mockKVStore['liked-objects:session:test-session-id-123']).toBe('["artwork:1","artwork:100"]');
        expect(mockKVStore['liked-objects:session:test-session-id-456']).toBe('["artwork:2"]');
    });

    it('should unlike the right object for the right session', async () => {
        mockKVStore['session:test-session-id-123'] = '{"sessionId":"test-session-id-123","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['session:test-session-id-456'] = '{"sessionId":"test-session-id-456","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['liked-objects:session:test-session-id-123'] = '["artwork:1", "artwork:100"]';
        mockKVStore['liked-objects:session:test-session-id-456'] = '["artwork:2", "artwork:100"]';
        mockKVStore['likes-count:artwork:1'] = '1';
        mockKVStore['likes-count:artwork:2'] = '1';
        mockKVStore['likes-count:artwork:100'] = '2';

        const mockLikeRequest = new Request(mockLikeUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'unlike',
            }),
            headers: {
                'Cookie': 'sessionId=test-session-id-123; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const likeResult = await apiWorker.fetch(mockLikeRequest, mockEnv);
        expect(likeResult.status).toBe(200);
        expect(likeResult.text()).resolves.toBe('Likes updated for artwork 100');
        expect(mockKVStore['likes-count:artwork:1']).toBe('1');
        expect(mockKVStore['likes-count:artwork:2']).toBe('1');
        expect(mockKVStore['likes-count:artwork:100']).toBe('1');
        expect(mockKVStore['liked-objects:session:test-session-id-123']).toBe('["artwork:1"]');
        expect(mockKVStore['liked-objects:session:test-session-id-456']).toBe('["artwork:2", "artwork:100"]');
    });

    it('should only like once', async () => {
        mockKVStore['session:test-session-id-123'] = '{"sessionId":"test-session-id-123","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['liked-objects:session:test-session-id-123'] = '["artwork:100"]';
        mockKVStore['likes-count:artwork:100'] = '1';

        const mockLikeRequest = new Request(mockLikeUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'like',
            }),
            headers: {
                'Cookie': 'sessionId=test-session-id-123; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const likeResult = await apiWorker.fetch(mockLikeRequest, mockEnv);
        
        expect(likeResult.status).toBe(400);
        expect(likeResult.text()).resolves.toContain('Cannot like. Object artwork:100 is already liked');
        expect(likeResult.headers.get('Set-Cookie')).toBeNull();
        expect(mockKVStore['likes-count:artwork:100']).toBe('1');
        expect(mockKVStore['liked-objects:session:test-session-id-123']).toBe('["artwork:100"]');
    });

    it('should only unlike once', async () => {
        mockKVStore['session:test-session-id-123'] = '{"sessionId":"test-session-id-123","createdAt":"2021-01-01T00:00:00.000Z"}';
        mockKVStore['liked-objects:session:test-session-id-123'] = '[]';

        const mockUnlikeRequest = new Request(mockLikeUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'unlike',
            }),
            headers: {
                'Cookie': 'sessionId=test-session-id-123; Path=/; HttpOnly; Secure; SameSite=Strict',
            }
        });
        const unlikeResult = await apiWorker.fetch(mockUnlikeRequest, mockEnv);
        
        expect(unlikeResult.status).toBe(400);
        expect(unlikeResult.text()).resolves.toContain('Cannot unlike. Object artwork:100 is not liked');
        expect(unlikeResult.headers.get('Set-Cookie')).toBeNull();
        expect(mockKVStore['likes-count:artwork:100']).toBeUndefined();
        expect(mockKVStore['liked-objects:session:test-session-id-123']).toBe('[]');
    });
});