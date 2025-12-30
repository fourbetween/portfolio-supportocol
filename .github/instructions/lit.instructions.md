---
applyTo: "view/src/**/*.ts"
---

# Lit 開発ガイドライン

## ディレクトリ構成 (`view/src/`)

### アプリケーション基盤 (`app/`)

- `context/`: 状態管理（Context API 等）。
- `layout/`: 共通レイアウト。
- `routes.ts`: ルーティング定義。

### 機能別実装 (`feature/[context]/`)

- `api/`: API クライアント。
- `component/`: **Container**: ビジネスロジック・副作用を含む。
- `page/`: ページコンポーネント。
- `ui/`: **Presenter**: 純粋な UI 部品。

### 共有リソース (`shared/`)

- `event/`: カスタムイベント定義。
- `style/`: 共通 CSS（`base.ts` 等）。
- `ui/`: 全体共通 UI コンポーネント。

## 実装ルール

### Lit コンポーネント

- `LitElement` を継承し、名称は `[context]-[name]` 形式（例: `learning-comment-list`）にする。
- 外部データは `@property`、内部状態は `@state` を使用する。
- プロパティ設定時はダブルクォートを使用しない。例: `<my-el .data=${data}></my-el>`
- `HTMLElementTagNameMap` の拡張は行わない。
- テキストは英語で記述する（多言語対応は後日）。

### Container/Presentational パターン

- **Container** (`component/`): 状態管理、ビジネスロジック、API 呼出を担当。テスト・ストーリー不要。
- **Presenter** (`ui/`): 表示に専念。アクションはコールバック経由で実行。
- API スキーマは `feature/[context]/api/schema.d.ts` を参照。

### スタイル

- Tailwind CSS は使用せず、標準 CSS を使用する。
- すべての Presenter は `shared/style/base.ts` を `static styles` に含める。
- アイコンは `shared/style/icon` の `iconStyle` を使用し、`material-symbols-outlined` クラスを適用する。

### メッセージ表示

- API 呼出の成否等の通知には `showToast` ヘルパーを使用する。
  - 例: `showToast(this, "Succeeded.", "success");`

### Storybook

- すべての Presenter (`ui/`) は Storybook ファイル (`.stories.ts`) を作成する。
- `title` は `[context]/ui/[name]` 形式にする。
- `component` にはカスタム要素のタグ名を指定する。
- `render` 関数内で `html` テンプレートを使用してコンポーネントをレンダリングする。

### テスト

- すべての Presenter (`ui/`) は Vitest Browser Mode を使用したテストファイル (`.test.ts`) を作成する。
- describe の第一引数はコンポーネント名のカスタム要素タグ名にする。
- it の第一引数は動作内容を**日本語**で記述する。
- `beforeEach` で要素を作成して `document.body` に追加し、`afterEach` で削除する。
- アサーションには `expect.element(page.getBy...)` を使用する。
