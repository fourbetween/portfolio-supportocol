import { type CSSResultGroup, css } from "lit";

/**
 * ページ共通のホストスタイル
 */
export const pageHostStyle: CSSResultGroup = css`
  :host {
    display: block;
    min-height: 100vh;
    background-color: var(--color-canvas-default);
  }
`;

/**
 * ページコンテナのスタイル
 * max-width は用途に応じて選択:
 * - narrow: 800px (フォームページ向け)
 * - medium: 900px (ルールフォームページ向け)
 * - wide: 1200px (リストページ・ダッシュボード向け)
 */
export const pageContainerStyle: CSSResultGroup = css`
  .container {
    padding: 24px;
  }

  .container--narrow {
    max-width: 800px;
  }

  .container--medium {
    max-width: 900px;
  }

  .container--wide {
    max-width: 1200px;
  }
`;

/**
 * ページ見出しのスタイル
 */
export const pageHeadingStyle: CSSResultGroup = css`
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-fg-default);
    margin: 0 0 24px 0;
  }

  h2 {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-fg-default);
    margin: 0;
  }
`;

/**
 * ページヘッダー（タイトル + アクション）のスタイル
 */
export const pageHeaderStyle: CSSResultGroup = css`
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-header h1 {
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
`;

/**
 * セクションのスタイル
 */
export const sectionStyle: CSSResultGroup = css`
  .section {
    margin-bottom: 32px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
`;

/**
 * リストアイテムの共通スタイル
 */
export const listItemStyle: CSSResultGroup = css`
  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .list-item {
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    margin-bottom: 8px;
    background-color: var(--color-canvas-default);
    transition: background-color 0.2s ease;
  }

  .list-item:hover {
    background-color: var(--color-canvas-subtle);
  }

  .list-item-link {
    display: block;
    padding: 12px 16px;
    text-decoration: none;
    color: inherit;
  }

  .list-item-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-fg-default);
  }

  .empty-message {
    padding: 12px 16px;
    color: var(--color-fg-muted);
    font-size: 14px;
  }
`;

/**
 * フォームアクションボタン群のスタイル
 */
export const formActionsStyle: CSSResultGroup = css`
  .form-actions {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
`;

/**
 * 検索入力のスタイル
 */
export const searchInputStyle: CSSResultGroup = css`
  .search-section {
    margin-bottom: 16px;
  }

  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    background-color: var(--color-canvas-default);
    color: var(--color-fg-default);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent-fg);
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
  }
`;

/**
 * 危険ボタンのスタイル
 */
export const dangerButtonStyle: CSSResultGroup = css`
  .btn-danger {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-danger-fg);
    background-color: var(--color-canvas-default);
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-danger:hover {
    color: var(--color-btn-primary-text);
    background-color: var(--color-danger-fg);
    border-color: var(--color-danger-fg);
  }
`;
