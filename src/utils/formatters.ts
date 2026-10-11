const currencyFormatter = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return currencyFormatter.format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '未取得';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未取得';
  return dateTimeFormatter.format(date);
}

export function parseOptionalInt(value: string | null | undefined): number | null {
  if (value == null || value.trim() === '') return null;
  const parsed = Number.parseInt(value.replace(/[,\s円]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calcValueDiff(
  purchasePrice: number | null | undefined,
  marketPrice: number | null | undefined,
): number | null {
  if (purchasePrice == null || marketPrice == null) return null;
  return marketPrice - purchasePrice;
}
