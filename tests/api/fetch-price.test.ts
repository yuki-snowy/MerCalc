import { beforeEach, describe, expect, it } from 'vitest';
import { createDemoAsset, resetDemoAssets } from '../../src/lib/demo-store';
import { POST } from '../../src/pages/api/fetch-price';
import { createApiContext, jsonRequest } from '../helpers/api';

describe('POST /api/fetch-price', () => {
  beforeEach(() => {
    resetDemoAssets();
  });

  it('推定相場と検索 URL を返す', async () => {
    const response = await POST(
      createApiContext(
        jsonRequest('http://localhost/api/fetch-price', {
          name: 'iPad Air',
          category: 'ガジェット',
          condition: 'good',
          purchasePrice: 100000,
        }),
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.estimatedPrice).toBe(65000);
    expect(body.searchUrl).toContain('mercari.com');
    expect(body.asset).toBeNull();
  });

  it('persist=true のとき資産の相場を更新する', async () => {
    const asset = createDemoAsset({
      user_id: null,
      name: '更新対象',
      category: '家電',
      brand: null,
      purchase_price: 50000,
      purchase_date: null,
      market_price: null,
      condition: 'good',
      notes: null,
      image_url: null,
    });

    const response = await POST(
      createApiContext(
        jsonRequest('http://localhost/api/fetch-price', {
          assetId: asset.id,
          name: asset.name,
          category: asset.category,
          condition: asset.condition,
          purchasePrice: asset.purchase_price,
          persist: true,
        }),
      ),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.asset?.id).toBe(asset.id);
    expect(body.asset?.market_price).toBe(body.estimatedPrice);
    expect(body.asset?.market_price_updated_at).toBeTruthy();
  });

  it('製品名が空なら 400 を返す', async () => {
    const response = await POST(
      createApiContext(
        jsonRequest('http://localhost/api/fetch-price', { name: '' }),
      ),
    );

    expect(response.status).toBe(400);
  });
});
