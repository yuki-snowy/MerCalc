# MerValue

**家の中のモノ、いまいくら？**

自宅で保有するガジェット・家電・家具・楽器などを登録し、  
**減価償却の目安**と**参考中古相場**から資産価値を見える化する Web アプリケーションです。

個人開発プロダクトとして、SSR・型安全・テスト・CI・無料枠での本番運用までを一通り実装しています。

---

## できること

| 機能 | 内容 |
| --- | --- |
| 資産 CRUD | 製品名・カテゴリ・購入価格／日・状態・画像などを登録・編集・削除 |
| カテゴリ自動判定 | 製品名からカテゴリを推定（API） |
| 参考相場の推定 | カテゴリ・状態・購入価格から中古相場を推定（スクレイピングなし） |
| メ〇カリ検索導線 | 製品名付きで外部検索へ遷移し、実相場の確認を支援 |
| 減価償却の目安 | カテゴリ別耐用年数・定額法（残存 10%）で簿価を算出 |
| 対簿価シグナル | 推定相場と簿価の差分をプラス／マイナスで表示 |
| ダッシュボード | 相場合計、推移グラフ、カテゴリ構成比、最近の登録 |
| 一覧 UX | サムネイル付きリスト、ページネーション、上部へ戻る、削除確認 |

---

## 技術スタック

| 領域 | 技術 | 選定の意図 |
| --- | --- | --- |
| フレームワーク | [Astro](https://astro.build/) SSR + TypeScript | ページは軽量に、必要な箇所だけインタラクティブに |
| UI | Tailwind CSS v4 / React Islands | ユーティリティファースト + 相場ボタン等の島コンポーネント |
| データ | [Supabase](https://supabase.com/)（PostgreSQL） | BaaS で Auth / DB を短期間で接続可能に |
| デモ運用 | インメモリ・シードストア | 環境変数なしでも UI・ロジックを検証可能 |
| ホスティング | [Netlify](https://www.netlify.com/) + `@astrojs/netlify` | SSR / API を Functions として無料枠で公開 |
| テスト | Vitest + Testing Library | 単体・コンポーネント・API 結合を層分け |
| CI | GitHub Actions | PR / push で check → test → build を自動実行 |

**Node.js** `>= 22.12` を想定しています。

---

## 設計上の判断

採用・技術選定の観点で意図しているポイントです。

1. **スクレイピングをしない**  
   メルカリ等への直接取得は利用規約・可用性リスクが高いため行いません。  
   代わりに推定ロジック + 検索 URL 導線で「参考値」と「実相場確認」を分離しています。

2. **UI とビジネスロジックの分離**  
   減価償却・相場推定・カテゴリ判定・集計は `src/services/` に集約し、ページは表示と入出力に寄せています。

3. **デモモードでオンボーディングを短縮**  
   `PUBLIC_DEMO_MODE=true` なら Supabase なしで起動でき、レビューや面接前の動作確認コストを下げます。

4. **破壊操作には確認を挟む**  
   資産削除はネイティブ `confirm` ではなく、アプリ内ダイアログで明示的な確定操作を要求します。

5. **無料枠前提の運用設計**  
   Supabase Free / Netlify Free を前提に、個人〜小規模利用で Zero Cost 運用を想定しています（制限・休止あり）。

---

## 画面構成

| パス | 役割 |
| --- | --- |
| `/` | TOP（ブランド・キャッチ・導線） |
| `/dashboard` | 資産サマリー（金額 / 推移 / カテゴリ構成 / 最近の登録） |
| `/assets` | 資産一覧（フィルタ・ページネーション・メ〇カリ検索） |
| `/assets/new` | 新規登録 |
| `/assets/[id]` | 詳細・編集・削除確認 |
| `/api/auto-category` | カテゴリ自動判定 API |
| `/api/fetch-price` | 参考相場推定 API |

---

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
cp .env.example .env
```

### 2. デモモード（おすすめの初回起動）

`.env` の `PUBLIC_DEMO_MODE=true` のまま起動できます。

```bash
npm run dev
```

`http://localhost:4321` でシードデータを使った UI 確認が可能です。  
※ プロセス再起動でデモデータは初期化されます。

### 3. Supabase 接続（永続化）

1. Supabase プロジェクトを作成  
2. SQL Editor で `supabase/migrations/0000_init_assets.sql` を実行  
3. `.env` を設定

```env
PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_DEMO_MODE=false
```

> 初期マイグレーションには個人利用向けの `anon` 全操作ポリシーが含まれます。  
> Auth を本格運用する場合は、当該ポリシーを見直してください。

### 4. Netlify デプロイ

1. GitHub リポジトリを Netlify に Import  
2. `netlify.toml` により Build command / Publish directory / Node 22 を自動検出  
3. Environment variables を設定（最低限 `PUBLIC_DEMO_MODE`）  
4. Deploy — SSR と `/api/*` は Netlify Functions として動作

---

## 品質保証

### テストの層分け

| 層 | 対象例 | 置き場 | 目的 |
| --- | --- | --- | --- |
| 単体 | 減価償却・相場推定・カテゴリ・フォーマッタ・Mercari URL | `src/**/*.test.ts` | 仕様の回帰を早く安く検知 |
| コンポーネント | 相場取得ボタン | `*.test.tsx` + jsdom | 操作と表示の確認 |
| API 結合 | `/api/auto-category` `/api/fetch-price` | `tests/api/` | 入出力契約（status / JSON）の固定 |
| CI | check / test / build | `.github/workflows/ci.yml` | PR・push 時の自動検証 |

### よく使うコマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run check` | Astro / TypeScript チェック |
| `npm run test` | テスト一括実行 |
| `npm run test:watch` | 監視モード |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run build` | 本番ビルド |
| `npm run ci` | check → test → build（ローカルで CI 相当） |

### CI パイプライン

1. `npm ci`  
2. `npm run check`  
3. `npm run test:coverage`  
4. `npm run build`（`PUBLIC_DEMO_MODE=true`）

> E2E（Playwright 等）は未導入です。画面遷移全体の自動確認が必要になった段階で追加する想定です。

---

## ディレクトリ構成

```text
src/
├── components/     # UI（Astro / React Islands）
├── layouts/        # 共通レイアウト
├── lib/            # Supabase クライアント / デモストア
├── pages/          # ルーティング & API エンドポイント
├── services/       # ビジネスロジック（減価償却・相場・集計など）
├── types/          # 型定義
└── utils/          # 共通ユーティリティ（表示整形・Mercari URL など）
tests/
├── api/            # API 結合テスト
├── helpers/        # テストヘルパー
└── setup.ts
.github/workflows/  # CI
supabase/migrations/
```

---

## 運用上の注意

- **推定相場は参考値です。** 税務計算や投資判断の根拠には使えません。  
- Supabase Free Tier はプロジェクト休止や制限があります。長期未アクセス時は再起動が必要な場合があります。  
- Netlify Free は帯域・Functions 実行時間に制限があります。個人利用想定です。

---

## ライセンス / 作者

個人開発プロジェクト（ポートフォリオ用途を含む）です。  
リポジトリ: [yuki-snowy/MerValue](https://github.com/yuki-snowy/MerValue)
