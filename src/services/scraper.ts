/**
 * 中古相場の推定サービス。
 *
 * メルカリ等への直接スクレイピングは利用規約・安定性の観点から行わず、
 * カテゴリ・状態・購入価格に基づく推定相場を返す。
 * 手動確認用に検索 URL も併せて提供する。
 */

import type { AssetCategory, AssetCondition } from '../types/asset';
import { buildMercariSearchUrl } from '../utils/mercari';
import { suggestCategory } from './category';

export interface MarketPriceResult {
  estimatedPrice: number;
  currency: 'JPY';
  source: 'estimate';
  confidence: number;
  sampleSize: number;
  searchUrl: string;
  note: string;
  fetchedAt: string;
}

const CATEGORY_BASE: Record<AssetCategory, number> = {
  ガジェット: 28000,
  家電: 22000,
  家具: 12000,
  楽器: 30000,
  ファッション: 8000,
  ホビー: 6500,
  その他: 5000,
};

const CONDITION_RATE: Record<AssetCondition, number> = {
  new: 0.92,
  like_new: 0.8,
  good: 0.65,
  fair: 0.45,
  poor: 0.25,
};

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function estimateFromPurchase(
  purchasePrice: number | null | undefined,
  condition: AssetCondition,
): number | null {
  if (purchasePrice == null || purchasePrice <= 0) return null;
  return Math.round(purchasePrice * CONDITION_RATE[condition]);
}

export function estimateMarketPrice(options: {
  name: string;
  category?: string | null;
  condition?: AssetCondition | null;
  purchasePrice?: number | null;
}): MarketPriceResult {
  const name = options.name.trim();
  const suggestion = suggestCategory(name);
  const category = (options.category || suggestion.category) as AssetCategory;
  const condition = options.condition ?? 'good';

  const fromPurchase = estimateFromPurchase(options.purchasePrice, condition);
  const base = CATEGORY_BASE[category] ?? CATEGORY_BASE['その他'];
  const seed = hashSeed(`${name}:${category}:${condition}`);
  const jitter = 0.85 + (seed % 30) / 100;
  const fromCategory = Math.round(base * CONDITION_RATE[condition] * jitter);

  const estimatedPrice = fromPurchase ?? fromCategory;
  const confidence = fromPurchase
    ? 0.72
    : Math.max(0.4, suggestion.confidence * 0.8);

  return {
    estimatedPrice,
    currency: 'JPY',
    source: 'estimate',
    confidence: Number(confidence.toFixed(2)),
    sampleSize: 0,
    searchUrl: buildMercariSearchUrl(name),
    note:
      'メルカリ等への自動スクレイピングは行っていません。カテゴリ・状態・購入価格から推定した参考値です。検索リンクで実相場を確認できます。',
    fetchedAt: new Date().toISOString(),
  };
}
