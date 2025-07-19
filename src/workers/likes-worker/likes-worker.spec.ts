import likesWorker from "./likes-worker";

// TODO: for every test check the state of the key-value store

describe('Likes Worker', () => {
    const mockUrl = 'http://localhost:8787/likes';
    const mockEnvEmpty = {
        'irin-portfolio': {
            get: jest.fn(),
            put: jest.fn(),
        } as unknown as KVNamespace,
    };

    it('should return 405 for non-POST requests', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'GET',
        });
        const result = await likesWorker.fetch(mockRequest, mockEnvEmpty);

        expect(result.status).toBe(405);
    });

    it('should return 401 for missing sessionId', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'POST',
            headers: {
                'Cookie': 'sessionId=; Path=/; HttpOnly; Secure; SameSite=Strict',
            },
        });
        const result = await likesWorker.fetch(mockRequest, mockEnvEmpty);

        expect(result.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'POST',
            body: 'invalid',
            headers: {
                'Cookie': 'sessionId=123; Path=/; HttpOnly; Secure; SameSite=Strict',
            },
        });
        const result = await likesWorker.fetch(mockRequest, mockEnvEmpty);
        expect(result.status).toBe(400);
    });

    it('should return 400 for invalid request body', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'invalid',
                objectId: '100',
                likeType: 'like',
            }),
            headers: {
                'Cookie': 'sessionId=123; Path=/; HttpOnly; Secure; SameSite=Strict',
            },
        });
        const result = await likesWorker.fetch(mockRequest, mockEnvEmpty);

        expect(result.status).toBe(400);
    });

    it('should return 400 when object is already liked', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'like',
            }),
            headers: {
                'Cookie': 'sessionId=123; Path=/; HttpOnly; Secure; SameSite=Strict',
            },
        });
        const mockEnv = {
            'irin-portfolio': {
                get: jest.fn().mockResolvedValue('["artwork:100"]'),
                put: jest.fn(),
            } as unknown as KVNamespace,
        };
        const result = await likesWorker.fetch(mockRequest, mockEnv);
        expect(result.status).toBe(400);
    });

    it('should like an object', async () => {
        const mockRequest = new Request(mockUrl, {
            method: 'POST',
            body: JSON.stringify({
                objectType: 'artwork',
                objectId: '100',
                likeType: 'like',
            }),
            headers: {
                'Cookie': 'sessionId=123; Path=/; HttpOnly; Secure; SameSite=Strict',
            },
        });
        const mockEnv = {
            'irin-portfolio': {
                get: jest.fn().mockResolvedValue('[]'),
                put: jest.fn(),
            } as unknown as KVNamespace,
        };
        
        const result = await likesWorker.fetch(mockRequest, mockEnv);
        expect(result.status).toBe(200);
    });
}); 