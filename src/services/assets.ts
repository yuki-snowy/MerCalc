import { createServerSupabase, isDemoMode, isSupabaseConfigured } from '../lib/supabase';
import {
  createDemoAsset,
  deleteDemoAsset,
  getDemoAsset,
  listDemoAssets,
  updateDemoAsset,
} from '../lib/demo-store';
import type {
  Asset,
  AssetInsert,
  AssetUpdate,
  DashboardStats,
} from '../types/asset';

export async function listAssets(): Promise<Asset[]> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return listDemoAssets();
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Asset[];
}

export async function getAssetById(id: string): Promise<Asset | null> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return getDemoAsset(id);
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Asset | null) ?? null;
}

export async function createAsset(input: AssetInsert): Promise<Asset> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    return createDemoAsset(input);
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('assets')
    .insert(input)
    .select('*')
    .single();

  if (error) throw error;
  return data as Asset;
}

export async function updateAsset(id: string, patch: AssetUpdate): Promise<Asset> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    const updated = updateDemoAsset(id, patch);
    if (!updated) throw new Error('資産が見つかりません');
    return updated;
  }

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('assets')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Asset;
}

export async function deleteAsset(id: string): Promise<void> {
  if (isDemoMode() || !isSupabaseConfigured()) {
    const ok = deleteDemoAsset(id);
    if (!ok) throw new Error('資産が見つかりません');
    return;
  }

  const supabase = createServerSupabase();
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) throw error;
}

export function buildDashboardStats(assets: Asset[]): DashboardStats {
  const categoryMap = new Map<string, { count: number; marketValue: number }>();

  let totalPurchaseValue = 0;
  let totalMarketValue = 0;

  for (const asset of assets) {
    totalPurchaseValue += asset.purchase_price ?? 0;
    totalMarketValue += asset.market_price ?? 0;

    const current = categoryMap.get(asset.category) ?? { count: 0, marketValue: 0 };
    current.count += 1;
    current.marketValue += asset.market_price ?? 0;
    categoryMap.set(asset.category, current);
  }

  return {
    totalAssets: assets.length,
    totalPurchaseValue,
    totalMarketValue,
    categoryBreakdown: [...categoryMap.entries()]
      .map(([category, value]) => ({ category, ...value }))
      .sort((a, b) => b.marketValue - a.marketValue),
  };
}
