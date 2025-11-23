import { type CSSResultGroup, css } from "lit";

export const pageStyle: CSSResultGroup = [
  css`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .page-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0;
      color: var(--color-fg-default);
    }
  `,
];
