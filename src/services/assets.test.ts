import { beforeEach, describe, expect, it } from 'vitest';
import { resetDemoAssets } from '../lib/demo-store';
import {
  buildDashboardStats,
  createAsset,
  deleteAsset,
  getAssetById,
  listAssets,
  updateAsset,
} from './assets';

describe('assets service (demo mode)', () => {
  beforeEach(() => {
    resetDemoAssets();
  });

  it('シード資産を一覧取得できる', async () => {
    const assets = await listAssets();
    expect(assets.length).toBeGreaterThanOrEqual(4);
    expect(assets[0]).toHaveProperty('name');
  });

  it('新規作成・取得・更新・削除ができる', async () => {
    const created = await createAsset({
      user_id: null,
      name: 'テスト資産',
      category: 'ホビー',
      brand: 'TestBrand',
      purchase_price: 3000,
      purchase_date: '2024-05-01',
      market_price: 2000,
      condition: 'good',
      notes: null,
      image_url: null,
    });

    expect(created.id).toBeTruthy();
    expect(await getAssetById(created.id)).toMatchObject({
      name: 'テスト資産',
      category: 'ホビー',
    });

    const updated = await updateAsset(created.id, { market_price: 2500 });
    expect(updated.market_price).toBe(2500);

    await deleteAsset(created.id);
    expect(await getAssetById(created.id)).toBeNull();
  });

  it('存在しない ID の更新はエラーになる', async () => {
    await expect(
      updateAsset('missing-id', { name: 'x' }),
    ).rejects.toThrow('資産が見つかりません');
  });
});

describe('buildDashboardStats', () => {
  it('合計とカテゴリ内訳を集計する', () => {
    const stats = buildDashboardStats([
      {
        id: '1',
        user_id: null,
        name: 'A',
        category: 'ガジェット',
        brand: null,
        purchase_price: 10000,
        purchase_date: null,
        market_price: 7000,
        market_price_updated_at: null,
        condition: 'good',
        notes: null,
        image_url: null,
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        user_id: null,
        name: 'B',
        category: 'ガジェット',
        brand: null,
        purchase_price: 5000,
        purchase_date: null,
        market_price: 3000,
        market_price_updated_at: null,
        condition: 'fair',
        notes: null,
        image_url: null,
        created_at: '',
        updated_at: '',
      },
      {
        id: '3',
        user_id: null,
        name: 'C',
        category: '家具',
        brand: null,
        purchase_price: 20000,
        purchase_date: null,
        market_price: 8000,
        market_price_updated_at: null,
        condition: 'good',
        notes: null,
        image_url: null,
        created_at: '',
        updated_at: '',
      },
    ]);

    expect(stats.totalAssets).toBe(3);
    expect(stats.totalPurchaseValue).toBe(35000);
    expect(stats.totalMarketValue).toBe(18000);
    expect(stats.categoryBreakdown[0].category).toBe('ガジェット');
    expect(stats.categoryBreakdown[0].count).toBe(2);
  });
});
