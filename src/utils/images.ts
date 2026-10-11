import type { AssetCategory } from '../types/asset';

/** カテゴリ未設定・未知カテゴリ時の既定サムネ */
const FALLBACK_THUMB = '/thumbs/other.svg';

export const CATEGORY_DEFAULT_IMAGES: Record<AssetCategory, string> = {
  ガジェット: '/thumbs/gadget.svg',
  家電: '/thumbs/appliance.svg',
  家具: '/thumbs/furniture.svg',
  楽器: '/thumbs/instrument.svg',
  ファッション: '/thumbs/fashion.svg',
  ホビー: '/thumbs/hobby.svg',
  その他: '/thumbs/other.svg',
};

export function getCategoryDefaultImage(category: string | null | undefined): string {
  if (category && category in CATEGORY_DEFAULT_IMAGES) {
    return CATEGORY_DEFAULT_IMAGES[category as AssetCategory];
  }
  return FALLBACK_THUMB;
}

/** レコードの image_url があれば優先。なければカテゴリ既定画像 */
export function resolveAssetImageUrl(asset: {
  image_url?: string | null;
  category?: string | null;
}): string {
  const custom = asset.image_url?.trim();
  if (custom) return custom;
  return getCategoryDefaultImage(asset.category);
}
