import { type CSSResultGroup, css } from "lit";

export const paginationStyle: CSSResultGroup = css`
  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 16px 0;
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 4px 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-fg-default);
    background-color: var(--color-canvas-default);
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-decoration: none;
  }

  .pagination-btn:hover:not(:disabled):not(.pagination-btn--active) {
    background-color: var(--color-btn-hover-bg);
  }

  .pagination-btn:disabled {
    color: var(--color-fg-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .pagination-btn--active {
    color: var(--color-btn-primary-text);
    background-color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
  }

  .pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    font-size: 14px;
    color: var(--color-fg-muted);
  }
`;
