import type { APIRoute } from 'astro';
import { updateAsset } from '../../services/assets';
import { estimateMarketPrice } from '../../services/scraper';
import type { AssetCondition } from '../../types/asset';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name : '';
    const category = typeof body.category === 'string' ? body.category : null;
    const condition = (body.condition as AssetCondition | undefined) ?? 'good';
    const purchasePrice =
      typeof body.purchasePrice === 'number'
        ? body.purchasePrice
        : body.purchasePrice == null
          ? null
          : Number.parseInt(String(body.purchasePrice), 10);
    const assetId = typeof body.assetId === 'string' ? body.assetId : null;
    const persist = Boolean(body.persist && assetId);

    if (!name.trim()) {
      return new Response(JSON.stringify({ error: '製品名が必要です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = estimateMarketPrice({
      name,
      category,
      condition,
      purchasePrice: Number.isFinite(purchasePrice as number)
        ? (purchasePrice as number)
        : null,
    });

    let asset = null;
    if (persist && assetId) {
      asset = await updateAsset(assetId, {
        market_price: result.estimatedPrice,
        market_price_updated_at: result.fetchedAt,
      });
    }

    return new Response(JSON.stringify({ ...result, asset }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '相場の取得に失敗しました';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
