import { type CSSResultGroup, css } from "lit";

export const buttonStyle: CSSResultGroup = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 5px 16px;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    white-space: nowrap;
    vertical-align: middle;
    cursor: pointer;
    user-select: none;
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    appearance: none;
    background-color: var(--color-btn-bg);
    color: var(--color-btn-text);
    text-decoration: none;
    transition: background-color 0.2s ease;
  }

  .btn:hover {
    background-color: var(--color-btn-hover-bg);
    text-decoration: none;
  }

  .btn:disabled {
    color: var(--color-fg-muted);
    background-color: var(--color-btn-bg);
    border-color: var(--color-border-default);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-primary {
    color: var(--color-btn-primary-text);
    background-color: var(--color-btn-primary-bg);
    border-color: var(--color-btn-primary-border);
  }

  .btn-primary:hover {
    background-color: var(--color-btn-primary-hover-bg);
  }

  .btn-primary:disabled {
    background-color: var(--color-disabled-btn-bg);
    border-color: var(--color-btn-primary-border);
    color: var(--color-btn-primary-text);
  }
`;
