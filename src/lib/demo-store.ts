import type { Asset, AssetInsert, AssetUpdate } from '../types/asset';

const now = new Date().toISOString();

/** 直近12ヶ月の推移が読みやすいよう購入月を散らす */
const seedAssets: Asset[] = [
  {
    id: 'demo-001',
    user_id: null,
    name: 'iPad Air (第5世代)',
    category: 'ガジェット',
    brand: 'Apple',
    purchase_price: 92800,
    purchase_date: '2025-11-12',
    market_price: 62000,
    market_price_updated_at: now,
    condition: 'good',
    notes: 'キーボードカバー付き',
    image_url: '/thumbs/gadget.svg',
    created_at: '2025-11-12T10:00:00.000Z',
    updated_at: now,
  },
  {
    id: 'demo-002',
    user_id: null,
    name: 'ダイソン V12 Detect Slim',
    category: '家電',
    brand: 'Dyson',
    purchase_price: 79800,
    purchase_date: '2026-01-20',
    market_price: 54000,
    market_price_updated_at: now,
    condition: 'like_new',
    notes: null,
    image_url: '/thumbs/appliance.svg',
    created_at: '2026-01-20T10:00:00.000Z',
    updated_at: now,
  },
  {
    id: 'demo-003',
    user_id: null,
    name: 'YAMAHA P-125',
    category: '楽器',
    brand: 'YAMAHA',
    purchase_price: 75900,
    purchase_date: '2025-12-03',
    market_price: 48000,
    market_price_updated_at: now,
    condition: 'good',
    notes: 'スタンド・ペダル付き',
    image_url: '/thumbs/instrument.svg',
    created_at: '2025-12-03T10:00:00.000Z',
    updated_at: now,
  },
  {
    id: 'demo-004',
    user_id: null,
    name: '無印良品 ソファ (2シーター)',
    category: '家具',
    brand: '無印良品',
    purchase_price: 59900,
    purchase_date: '2026-03-15',
    market_price: 18000,
    market_price_updated_at: now,
    condition: 'fair',
    notes: 'カバー洗濯済み',
    image_url: '/thumbs/furniture.svg',
    created_at: '2026-03-15T10:00:00.000Z',
    updated_at: now,
  },
  {
    id: 'demo-005',
    user_id: null,
    name: 'Sony WH-1000XM5',
    category: 'ガジェット',
    brand: 'Sony',
    purchase_price: 49500,
    purchase_date: '2026-06-02',
    market_price: 36000,
    market_price_updated_at: now,
    condition: 'good',
    notes: null,
    image_url: '/thumbs/gadget.svg',
    created_at: '2026-06-02T10:00:00.000Z',
    updated_at: now,
  },
  {
    id: 'demo-006',
    user_id: null,
    name: 'Switch 本体セット',
    category: 'ホビー',
    brand: 'Nintendo',
    purchase_price: 37980,
    purchase_date: '2026-09-18',
    market_price: 28000,
    market_price_updated_at: now,
    condition: 'good',
    notes: 'ドック付き',
    image_url: '/thumbs/hobby.svg',
    created_at: '2026-09-18T10:00:00.000Z',
    updated_at: now,
  },
];

/** サーバープロセス内のデモ用メモリストア（再起動でリセット） */
let demoAssets: Asset[] = structuredClone(seedAssets);

export function listDemoAssets(): Asset[] {
  return [...demoAssets].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function getDemoAsset(id: string): Asset | null {
  return demoAssets.find((asset) => asset.id === id) ?? null;
}

export function createDemoAsset(input: AssetInsert): Asset {
  const timestamp = new Date().toISOString();
  const asset: Asset = {
    id: crypto.randomUUID(),
    user_id: input.user_id ?? null,
    name: input.name,
    category: input.category,
    brand: input.brand ?? null,
    purchase_price: input.purchase_price ?? null,
    purchase_date: input.purchase_date ?? null,
    market_price: input.market_price ?? null,
    market_price_updated_at: input.market_price_updated_at ?? null,
    condition: input.condition ?? 'good',
    notes: input.notes ?? null,
    image_url: input.image_url ?? null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  demoAssets = [asset, ...demoAssets];
  return asset;
}

export function updateDemoAsset(id: string, patch: AssetUpdate): Asset | null {
  const index = demoAssets.findIndex((asset) => asset.id === id);
  if (index < 0) return null;

  const updated: Asset = {
    ...demoAssets[index],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  demoAssets[index] = updated;
  return updated;
}

export function deleteDemoAsset(id: string): boolean {
  const before = demoAssets.length;
  demoAssets = demoAssets.filter((asset) => asset.id !== id);
  return demoAssets.length < before;
}

export function resetDemoAssets(): void {
  demoAssets = structuredClone(seedAssets);
}
