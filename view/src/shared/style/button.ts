import { type CSSResultGroup, css } from "lit";

export const buttonStyle: CSSResultGroup = css`
  .btn-primary {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-btn-primary-text);
    background-color: var(--color-btn-primary-bg);
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover {
    background-color: var(--color-btn-primary-hover-bg);
  }

  .btn-secondary {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-fg-default);
    background-color: var(--color-canvas-subtle);
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-secondary:hover {
    background-color: var(--color-border-muted);
  }
`;
