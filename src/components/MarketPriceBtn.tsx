import { useState } from 'react';

interface MarketPriceResponse {
  estimatedPrice: number;
  confidence: number;
  searchUrl: string;
  note: string;
  fetchedAt: string;
}

interface Props {
  assetId?: string;
  name?: string;
  category?: string;
  condition?: string;
  purchasePrice?: number | null;
}

function readFormField(id: string): string {
  const el = document.getElementById(id) as
    | HTMLInputElement
    | HTMLSelectElement
    | null;
  return el?.value?.trim() ?? '';
}

export default function MarketPriceBtn({
  assetId,
  name = '',
  category = '',
  condition = 'good',
  purchasePrice = null,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketPriceResponse | null>(null);

  async function handleClick() {
    const liveName = readFormField('name') || name;
    const liveCategory = readFormField('category') || category;
    const liveCondition = readFormField('condition') || condition;
    const livePurchaseRaw = readFormField('purchase_price');
    const livePurchasePrice = livePurchaseRaw
      ? Number.parseInt(livePurchaseRaw, 10)
      : purchasePrice;

    if (!liveName) {
      setError('製品名を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/fetch-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId,
          name: liveName,
          category: liveCategory,
          condition: liveCondition,
          purchasePrice: Number.isFinite(livePurchasePrice as number)
            ? livePurchasePrice
            : null,
          persist: Boolean(assetId),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? '相場の取得に失敗しました');
      }

      setResult(data as MarketPriceResponse);

      const marketInput = document.getElementById(
        'market_price',
      ) as HTMLInputElement | null;
      if (marketInput) {
        marketInput.value = String(data.estimatedPrice);
      }

      if (assetId) {
        window.location.reload();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '相場の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="btn-beep btn-beep-accent inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? '相場を推定中…' : '中古相場を更新'}
      </button>

      {error && (
        <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
      )}

      {result && (
        <div className="rounded-lg bg-accent-soft px-3 py-3 text-sm text-ink">
          <p className="font-semibold tabular-nums">
            推定相場: ¥{result.estimatedPrice.toLocaleString('ja-JP')}
            <span className="ml-2 font-normal text-ink-muted">
              (信頼度 {(result.confidence * 100).toFixed(0)}%)
            </span>
          </p>
          <p className="mt-1 text-ink-muted">{result.note}</p>
          <a
            href={result.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block font-medium text-accent underline-offset-2 hover:underline"
          >
            メルカリで実相場を確認
          </a>
        </div>
      )}
    </div>
  );
}
