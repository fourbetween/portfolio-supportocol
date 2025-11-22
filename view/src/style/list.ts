import { type CSSResultGroup, css } from "lit";

export const listStyle: CSSResultGroup = [
  css`
    .list-group {
      background-color: var(--color-canvas-default);
      border: 1px solid var(--color-border-default);
      border-radius: 6px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .list-group-item {
      border-top: 1px solid var(--color-border-muted);
      padding: 16px;
      display: flex;
    }

    .list-group-item:first-child {
      border-top: none;
    }
  `,
];
