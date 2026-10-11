# MerCalc

自宅内で保有する製品・資材（ガジェット、家電、家具、楽器など）を可視化・管理する Web アプリケーションです。

製品名からのカテゴリ自動判定、参考中古相場の推定・更新、ダッシュボードでの資産価値把握を提供します。

## 構成

| 層 | 技術 | プラン |
| --- | --- | --- |
| フロント / SSR | Astro (Hybrid/SSR) + TypeScript + Tailwind CSS + React Islands | — |
| DB / Auth / Storage | Supabase | Free Tier |
| ホスティング | Vercel | Hobby |
| 相場 API | Astro Server Endpoints | Vercel Functions 内で実行 |

個人利用の範囲であれば、更新・保守込みで Zero Cost 運用を想定しています。

## 運用上の注意（実装判断）

- **メルカリ等の直接スクレイピングは行いません。** 利用規約・可用性の観点から、カテゴリ・状態・購入価格に基づく**推定相場**を返します。実相場確認用にメルカリ検索 URL を併記します。
- Supabase Free Tier はプロジェクト休止や制限があるため、長期間アクセスがない場合は再起動が必要になることがあります。
- Vercel Hobby は商用利用や帯域に制限があります。個人利用想定です。
- 初期マイグレーションには個人利用向けの `anon` 全操作ポリシーが含まれます。Auth を本格運用する場合は当該ポリシーを削除してください。

## セットアップ

### 1. 依存関係

```bash
npm install
cp .env.example .env
```

### 2. デモモード（Supabase なし）

`.env` のまま起動できます。

```bash
npm run dev
```

`http://localhost:4321` でシードデータを使った UI 確認が可能です（プロセス再起動でデモデータは初期化されます）。

### 3. Supabase 接続

1. Supabase プロジェクトを作成
2. SQL Editor で `supabase/migrations/0000_init_assets.sql` を実行
3. `.env` を設定

```env
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_DEMO_MODE=false
```

### 4. Vercel デプロイ

1. GitHub 等へ push
2. Vercel で Import
3. Environment Variables に上記を設定
4. Framework Preset: Astro（`@astrojs/vercel` 済み）

## 主要ルート

| パス | 内容 |
| --- | --- |
| `/` | ダッシュボード |
| `/assets` | 資産一覧 |
| `/assets/new` | 新規登録 |
| `/assets/[id]` | 詳細・編集 |
| `/api/auto-category` | カテゴリ自動判定 |
| `/api/fetch-price` | 参考中古相場の推定 |

## スクリプト

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run check` | Astro / TS チェック |

## ディレクトリ

```text
src/
├── components/     # UI (Astro / React)
├── layouts/        # 共通レイアウト
├── lib/            # Supabase / デモストア
├── pages/          # ルーティング & API
├── services/       # ビジネスロジック
├── types/          # 型定義
└── utils/          # フォーマッタ
supabase/migrations/
```
