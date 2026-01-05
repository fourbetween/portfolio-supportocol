---
applyTo: "view/src/**/*.ts"
---

# Lit 開発ガイドライン

## 1. ディレクトリ構成 (`view/src/`)

### 1.1 アプリケーション基盤 (`app/`)

- `context/`: 状態管理（Context API 等）
- `layout/`: 共通レイアウト
- `routes.ts`: ルーティング定義

### 1.2 機能別実装 (`feature/[context]/`)

- `api/`: API クライアント
- `component/`: **Container**（ビジネスロジック・副作用を担当）
- `event/`: イベント定義
- `page/`: ページコンポーネント
- `ui/`: **Presenter**（純粋な UI 部品）

### 1.3 共有リソース (`shared/`)

- `event/`: イベント定義
- `style/`: 共通 CSS（`base.ts` 等）
- `ui/`: 全体共通 UI コンポーネント

## 2. コンポーネント設計 (Container/Presenter)

- **Container** (`component/`):
  - 状態管理、ビジネスロジック、API 呼び出しを担当する。
  - 原則として Storybook やテストは不要。
- **Presenter** (`ui/`):
  - 表示とユーザー入力の検知に専念する。
  - API スキーマは `feature/[context]/api/schema.d.ts` を参照する。

## 3. コーディング規約

### 3.1 Lit コンポーネント

- `LitElement` を継承し、名称は `[context]-[name]` 形式（例: `learning-comment-list`）とする。
- 外部データは `@property`、内部状態は `@state` を使用する。
- コールバックを渡すのではなく、イベントを発火して親コンポーネントに通知する。
- プロパティ設定時はダブルクォートを使用しない。
  - 例: `<my-el .data=${data}></my-el>`
- `HTMLElementTagNameMap` の拡張は行わない。
- テキストは英語で記述する（多言語対応は後日）。
- クラス内の記述順序:
  1. インポート
  2. クラスデコレーター (`@customElement`)
  3. クラス定義
     1. プロパティ・状態定義 (`@property`, `@state`)
     2. ライフサイクルメソッド (`connectedCallback` 等)
     3. イベントハンドラー
     4. レンダーメソッド (`render` 等)
     5. スタイル定義 (`static styles`)

### 3.2 スタイル

- Tailwind CSS は使用せず、標準 CSS を使用する。
- すべての Presenter は `shared/style/base.ts` を `static styles` に含める。
- アイコンは `shared/style/icon` の `iconStyle` を使用し、`material-symbols-outlined` クラスを適用する。

### 3.3 メッセージ表示

- API 呼び出しの成否等の通知には `showToast` ヘルパーを使用する。
  - 成功時: `showToast(this, "Succeeded.", "success", 2000);`
  - エラー時: `showToast(this, error.message, "error");`

### 3.4 イベント

- 独自イベントの定義は `CustomEvent` を使用せず、`Event` を継承する。
- @click などのデフォルトイベントで対処できる場合は、独自イベントを作成しない。
- アクションを要求するイベントとアクションの完了を通知するイベントは区別する。
  - 要求イベント: `comment-select`
  - 通知イベント: `comment-selected`
- イベントの定義は以下を参考にする。

  ```ts
  export class CommentSelectEvent extends Event {
    public readonly commentId?: string;

    constructor(commentId?: string) {
      super(COMMENT_SELECT_EVENT_NAME, { bubbles: true, composed: true });
      this.commentId = commentId;
    }
  }
  ```

## 4. 品質管理

### 4.1 Storybook

- すべての Presenter (`ui/`) に対して Storybook ファイル (`.stories.ts`) を作成する。
- `title` は `[context]/ui/[name]` 形式とする。
- `component` にはカスタム要素のタグ名を指定する。
- `render` 関数内で `html` テンプレートを使用してレンダリングする。

### 4.2 テスト (Vitest Browser Mode)

すべての Presenter (`ui/`) に対してテストファイル (`.test.ts`) を作成する。

#### 4.2.1 レンダリング (Setup)

- `document.createElement` ではなく、`lit` の `render` 関数と `html` テンプレートを使用する。
- プロパティの受け渡しは、実際の利用シーンに近い `.prop=${value}` 形式で行う。
- スロット (Slot) を利用する場合は、`render` 内のテンプレートで宣言的に記述する。

#### 4.2.2 要素の特定と検証 (Assertion)

- `elem.shadowRoot.querySelector` 等の内部実装に依存するクエリは避け、`page.getByText` や `page.getByRole` 等のユーザー視点のクエリを優先する。
- Shadow DOM の境界を意識せずに済むよう、`vitest/browser` の `page` API を活用する。

#### 4.2.3 非同期処理

- Lit の更新サイクルを待機するため、必要に応じて `await elem.updateComplete` を使用するか、`expect.element(...).toBeVisible()` 等の非同期アサーションを使用する。

#### 4.2.4 テストケースの構成

- `describe` 内に `beforeEach` (コンテナの作成と追加) と `afterEach` (コンテナの削除) を含める。
- `describe` の第一引数はコンポーネント名のカスタム要素タグ名とする。
- 各 `it` ブロックでは特定の動作や状態を検証し、第一引数は動作内容を**日本語**で記述する。
