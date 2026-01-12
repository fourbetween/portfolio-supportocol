import { css } from "lit";

export const commentCardStyle = css`
  :host {
    display: block;
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    background-color: var(--color-canvas-default);
    overflow: hidden;
    position: relative;
  }

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .card-body.proposed {
    background-color: var(--color-canvas-inset);
  }

  .content {
    padding: 16px;
    padding-bottom: 24px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-fg-default);
  }

  .footer {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .child-count {
    padding: 2px 6px;
    font-size: 11px;
    font-weight: bold;
    color: var(--color-fg-muted);
    background-color: var(--color-canvas-subtle);
    border-radius: 10px;
    min-width: 18px;
    text-align: center;
    line-height: 1;
  }

  .created-at {
    font-size: 11px;
    color: var(--color-fg-muted);
  }
`;
