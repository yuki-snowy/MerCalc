/** 製品名などでメルカリ検索ページへ飛ばす URL を組み立てる */
export function buildMercariSearchUrl(query: string): string {
  const keyword = query.trim();
  const params = new URLSearchParams({
    keyword,
    status: 'sold_out',
  });
  return `https://jp.mercari.com/search?${params.toString()}`;
}
