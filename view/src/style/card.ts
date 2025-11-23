import { type CSSResultGroup, css } from "lit";

export const cardStyle: CSSResultGroup = [
  css`
    .card {
      background-color: var(--color-canvas-default);
      border: 1px solid var(--color-border-default);
      border-radius: 6px;
      margin-bottom: 16px;
    }

    .card-header {
      padding: 8px 16px;
      background-color: var(--color-canvas-subtle);
      border-bottom: 1px solid var(--color-border-default);
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    .card-body {
      padding: 16px;
    }

    .card-footer {
      padding: 8px 16px;
      border-top: 1px solid var(--color-border-muted);
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
    }
  `,
];
