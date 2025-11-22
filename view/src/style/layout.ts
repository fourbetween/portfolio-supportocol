import { type CSSResultGroup, css } from "lit";

export const layoutStyle: CSSResultGroup = [
  css`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid var(--color-border-muted);
      padding-bottom: 16px;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .section {
      background-color: var(--color-canvas-default);
      border: 1px solid var(--color-border-default);
      border-radius: 6px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 20px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border-muted);
    }

    .danger-zone {
      border: 1px solid #fdaeb7;
      border-radius: 6px;
      padding: 24px;
      margin-top: 40px;
    }

    .danger-zone h2 {
      color: var(--color-danger-fg);
      font-size: 18px;
      font-weight: 600;
      margin-top: 0;
      margin-bottom: 16px;
    }

    .danger-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-top: 1px solid var(--color-border-muted);
    }

    .danger-item:first-of-type {
      border-top: none;
      padding-top: 0;
    }

    .danger-item-content h4 {
      margin: 0 0 4px 0;
      font-size: 14px;
      font-weight: 600;
    }

    .danger-item-content p {
      margin: 0;
      font-size: 12px;
      color: var(--color-fg-muted);
    }
  `,
];
