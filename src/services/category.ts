import { ASSET_CATEGORIES, type AssetCategory } from '../types/asset';

interface CategoryRule {
  category: AssetCategory;
  keywords: string[];
  weight: number;
}

const RULES: CategoryRule[] = [
  {
    category: 'ガジェット',
    weight: 3,
    keywords: [
      'iphone',
      'ipad',
      'macbook',
      'airpods',
      'pixel',
      'galaxy',
      'switch',
      'playstation',
      'ps5',
      'xbox',
      'カメラ',
      'lens',
      'レンズ',
      'スマホ',
      'タブレット',
      'pc',
      'ノートpc',
      'イヤホン',
      'ヘッドホン',
      'watch',
      'ウォッチ',
      'ssd',
      'hdd',
      'ルーター',
    ],
  },
  {
    category: '家電',
    weight: 3,
    keywords: [
      '冷蔵庫',
      '洗濯機',
      '掃除機',
      'ダイソン',
      'dyson',
      '電子レンジ',
      'オーブン',
      'エアコン',
      '空気清浄',
      '加湿器',
      '除湿',
      'テレビ',
      'tv',
      '炊飯器',
      'ホットプレート',
      'トースター',
      'ドライヤー',
      'アイロン',
      'ファン',
      'サーキュレーター',
    ],
  },
  {
    category: '家具',
    weight: 3,
    keywords: [
      'ソファ',
      'ソファー',
      '机',
      'デスク',
      '椅子',
      'チェア',
      'ベッド',
      '棚',
      'シェルフ',
      '収納',
      'テーブル',
      '照明',
      'ランプ',
      'カーテン',
      'ラグ',
      'カーペット',
      '無印',
      'ikea',
      'ニトリ',
    ],
  },
  {
    category: '楽器',
    weight: 4,
    keywords: [
      'ギター',
      'ピアノ',
      'キーボード',
      'ドラム',
      'バイオリン',
      'ウクレレ',
      'シンセ',
      'マイク',
      'yamaha',
      'ヤマハ',
      'fender',
      'roland',
      'casio',
      '電子ピアノ',
    ],
  },
  {
    category: 'ファッション',
    weight: 2,
    keywords: [
      '靴',
      'スニーカー',
      'バッグ',
      '財布',
      'コート',
      'ジャケット',
      'パーカー',
      '時計',
      '腕時計',
      'ユニクロ',
      'nike',
      'adidas',
      'north face',
    ],
  },
  {
    category: 'ホビー',
    weight: 2,
    keywords: [
      'レゴ',
      'lego',
      'フィギュア',
      'プラモデル',
      'ガンプラ',
      'ボードゲーム',
      'トレカ',
      'ポケモンカード',
      '漫画',
      'コミック',
      'カメラ用品',
    ],
  },
];

export interface CategorySuggestion {
  category: AssetCategory;
  confidence: number;
  matchedKeywords: string[];
}

export function suggestCategory(productName: string): CategorySuggestion {
  const normalized = productName.trim().toLowerCase();
  if (!normalized) {
    return { category: 'その他', confidence: 0, matchedKeywords: [] };
  }

  let best: CategorySuggestion = {
    category: 'その他',
    confidence: 0,
    matchedKeywords: [],
  };

  for (const rule of RULES) {
    const matchedKeywords = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matchedKeywords.length === 0) continue;

    const confidence = Math.min(
      0.95,
      (matchedKeywords.length * rule.weight) / 10 + 0.35,
    );

    if (confidence > best.confidence) {
      best = {
        category: rule.category,
        confidence: Number(confidence.toFixed(2)),
        matchedKeywords,
      };
    }
  }

  if (!ASSET_CATEGORIES.includes(best.category as AssetCategory)) {
    return { category: 'その他', confidence: 0, matchedKeywords: [] };
  }

  return best;
}
