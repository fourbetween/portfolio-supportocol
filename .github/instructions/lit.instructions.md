---
applyTo: "view/src/**/*.ts"
---

## ディレクトリ構成

`view/src/` 以下のディレクトリ構成は、アプリケーションの基盤、機能ごとの実装、および共有リソースに分割されています。

### アプリケーション基盤 (`view/src/app/`)

アプリケーション全体の共通設定や構造を配置します。

- context/: アプリケーションレベルの状態管理（Context API など）。
- layout/: 共通のレイアウトコンポーネント。
- routes.ts: ルーティング定義。
- index.ts: エントリーポイント。

### 機能別実装 (`view/src/feature/[context]/`)

境界づけられたコンテキスト（例：`identity`, `learning`）ごとに機能を実装します。

- api/: バックエンド API との通信を行うクライアント。
- component/: その機能固有のビジネスロジック・副作用を含むコンポーネント。
- page/: ページ単位のコンポーネント。ルーティングの対象となります。
- ui/: その機能固有のロジックを持たない純粋な UI 部品。

### 共有リソース (`view/src/shared/`)

複数の機能間で共有されるコードを配置します。

- event/: カスタムイベントの定義。
- style/: 共通の CSS スタイル（base, button など）。
- ui/: ボタンや入力フォームなど、アプリケーション全体で共通の UI コンポーネント。

## Lit 実装ガイドライン

- コンポーネントは `LitElement` を継承して作成してください。
- コンポーネント名は `[context]-[name]` の形式（例：`learning-dashboard-page`）で定義してください。
- 外部から渡されるデータには `@property` デコレータを使用してください。
- コンポーネント内部の状態管理には `@state` デコレータを使用してください。
- スタイルは `static styles` に定義し、`shared/style` からインポートした共通スタイルを組み合わせて使用してください。
- コンポーネントにプロパティを設定する際に、ダブルクォートで囲まないでください。例: `<my-component .data=${data}></my-component>`
- declare global による HTMLElementTagNameMap の拡張（型定義の追加）は行わないでください。

## メッセージ

- api コールなどが失敗した場合のエラーメッセージ表示には、`showToast` ヘルパー関数を使用してください。 例:`showToast(this, "失敗しました。", "error");`
- 成功メッセージの表示にも `showToast` を使用してください。 例:`showToast(this, "成功しました。", "success");`
