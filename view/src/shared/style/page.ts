import { css } from "lit";

export const pageStyle = css`
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px;
    background-color: var(--color-canvas-default);
  }

  .header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--color-fg-default);
    margin: 0 0 8px 0;
  }

  .description {
    font-size: 16px;
    color: var(--color-fg-muted);
    line-height: 1.5;
  }

  .content {
    margin-top: 16px;
  }
`;
