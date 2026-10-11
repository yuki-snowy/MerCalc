export const ASSET_CATEGORIES = [
  'ガジェット',
  '家電',
  '家具',
  '楽器',
  'ファッション',
  'ホビー',
  'その他',
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const ASSET_CONDITIONS = [
  'new',
  'like_new',
  'good',
  'fair',
  'poor',
] as const;

export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export const CONDITION_LABELS: Record<AssetCondition, string> = {
  new: '新品',
  like_new: '未使用に近い',
  good: '良い',
  fair: 'やや難あり',
  poor: '難あり',
};

export interface Asset {
  id: string;
  user_id: string | null;
  name: string;
  category: AssetCategory | string;
  brand: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  market_price: number | null;
  market_price_updated_at: string | null;
  condition: AssetCondition;
  notes: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export type AssetInsert = Omit<
  Asset,
  'id' | 'created_at' | 'updated_at' | 'market_price_updated_at'
> & {
  id?: string;
  market_price_updated_at?: string | null;
};

export type AssetUpdate = Partial<
  Omit<Asset, 'id' | 'created_at' | 'updated_at'>
>;

export interface AssetFormValues {
  name: string;
  category: string;
  brand: string;
  purchase_price: string;
  purchase_date: string;
  market_price: string;
  condition: AssetCondition;
  notes: string;
  image_url: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalPurchaseValue: number;
  totalMarketValue: number;
  categoryBreakdown: Array<{ category: string; count: number; marketValue: number }>;
}
