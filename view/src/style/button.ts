import { type CSSResultGroup, css } from "lit";

export const buttonStyle: CSSResultGroup = [
  css`
    .btn {
      display: inline-block;
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
      background-color: var(--color-canvas-default);
      color: var(--color-fg-default);
      text-decoration: none;
    }

    .btn:hover {
      background-color: #f3f4f6;
      border-color: var(--color-border-muted);
    }

    .btn-primary {
      color: var(--color-btn-primary-text);
      background-color: var(--color-btn-primary-bg);
      border-color: rgba(27, 31, 36, 0.15);
    }

    .btn-primary:hover {
      background-color: var(--color-btn-primary-hover-bg);
    }

    .btn-outline {
      color: var(--color-fg-default);
      background-color: transparent;
      border-color: var(--color-border-default);
    }

    .btn-outline:hover {
      background-color: var(--color-canvas-subtle);
    }

    .btn-header {
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
      background-color: transparent;
    }

    .btn-header:hover {
      border-color: rgba(255, 255, 255, 0.8);
    }

    .btn-large {
      padding: 12px 24px;
      font-size: 18px;
    }
  `,
];
