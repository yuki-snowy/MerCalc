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
| `/` | TOP（ロゴ・キャッチ） |
| `/dashboard` | ダッシュボード（集計・グラフ） |
| `/assets` | 資産一覧（1カラム横長リスト） |
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
| `npm run test` | 単体・結合テスト（1回実行） |
| `npm run test:watch` | 監視モード（TDD 向け） |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run ci` | check → test → build（ローカルで CI 相当） |

## テスト工程（現場寄りの進め方）

このリポジトリでは、実務でよくあるテストの層分けを採用しています。

| 層 | 対象 | 置き場 | 目的 |
| --- | --- | --- | --- |
| 単体テスト | `formatters` / `category` / `scraper` / `assets` | ソース横の `*.test.ts` | 仕様の回帰を早く安く検知 |
| コンポーネントテスト | `MarketPriceBtn` | `*.test.tsx` + jsdom | ユーザー操作と表示の確認 |
| API 結合テスト | `/api/*` | `tests/api/` | 入出力契約（status / JSON）の固定 |
| CI | GitHub Actions | `.github/workflows/ci.yml` | PR/push で自動検証 |

### ローカルでの基本フロー

```bash
# 1. 実装しながら（赤→緑→リファクタ）
npm run test:watch

# 2. コミット前のセルフチェック
npm run ci
```

### CI で回していること

1. `npm ci`（ロックファイルどおりに依存関係を再現）
2. `npm run check`（型・Astro チェック）
3. `npm run test:coverage`（テスト + カバレッジ成果物）
4. `npm run build`（本番ビルドが通ること）

> 補足: E2E（Playwright 等）は未導入です。画面遷移全体の自動確認が必要になった段階で追加するのが、個人〜小規模チームではよくある進め方です。

## ディレクトリ

```text
src/
├── components/     # UI (Astro / React) + コンポーネントテスト
├── layouts/        # 共通レイアウト
├── lib/            # Supabase / デモストア
├── pages/          # ルーティング & API
├── services/       # ビジネスロジック + 単体テスト
├── types/          # 型定義
└── utils/          # フォーマッタ + 単体テスト
tests/
├── api/            # API 結合テスト
├── helpers/        # テスト用ヘルパー
└── setup.ts        # 共通セットアップ
.github/workflows/  # CI
supabase/migrations/
```
