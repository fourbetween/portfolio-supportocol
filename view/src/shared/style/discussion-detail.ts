import { css } from "lit";

export const discussionDetailStyle = css`
  .container {
    padding: 8px 0;
    background-color: var(--color-canvas-default);
  }

  .badge-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }

  .theme-row,
  .premise-row,
  .conclusion-row {
    margin-bottom: 24px;
  }

  .badge-row:last-child,
  .theme-row:last-child,
  .premise-row:last-child,
  .conclusion-row:last-child {
    margin-bottom: 0;
  }

  .theme {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    line-height: 1.4;
    color: var(--color-fg-default);
  }

  .premise,
  .conclusion {
    font-size: 14px;
    margin: 0;
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--color-fg-default);
    background-color: var(--color-canvas-subtle);
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--color-border-muted);
  }
`;
