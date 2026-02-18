import { css } from "lit";

export const emptyStyle = css`
  .empty {
    padding: 16px;
    text-align: center;
    color: var(--color-fg-muted);
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    background-color: var(--color-canvas-subtle);
    font-size: 14px;
  }
`;

export const listStyles = css`
  ${emptyStyle}
  .list {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
  }

  /* 子要素の境界線と角丸の制御 */
  .list > *:not(:last-child) {
    border-bottom: 1px solid var(--color-border-default);
  }

  .list > :first-child {
    --item-border-top-left-radius: 6px;
    --item-border-top-right-radius: 6px;
  }

  .list > :last-child {
    --item-border-bottom-left-radius: 6px;
    --item-border-bottom-right-radius: 6px;
  }

  .item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background-color: var(--color-canvas-default);
    cursor: pointer;
    border-radius: var(--item-border-top-left-radius, 0)
      var(--item-border-top-right-radius, 0)
      var(--item-border-bottom-right-radius, 0)
      var(--item-border-bottom-left-radius, 0);
  }

  .item:hover {
    background-color: var(--color-canvas-subtle);
  }
`;
