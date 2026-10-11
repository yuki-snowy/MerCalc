import { describe, expect, it } from 'vitest';
import { POST } from '../../src/pages/api/auto-category';
import { createApiContext, jsonRequest } from '../helpers/api';

describe('POST /api/auto-category', () => {
  it('製品名からカテゴリを返す', async () => {
    const response = await POST(
      createApiContext(
        jsonRequest('http://localhost/api/auto-category', {
          name: 'MacBook Air M2',
        }),
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.category).toBe('ガジェット');
    expect(body.confidence).toBeGreaterThan(0);
  });

  it('製品名が空なら 400 を返す', async () => {
    const response = await POST(
      createApiContext(
        jsonRequest('http://localhost/api/auto-category', { name: '  ' }),
      ),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });
});
