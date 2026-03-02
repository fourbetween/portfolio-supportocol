import { css } from "lit";

/**
 * ホバー時に表示されるアクションボタン群のスタイル
 */
export const actionStyle = css`
  .hover-container {
    position: relative;
  }
  .actions {
    display: flex;
    gap: 8px;
    position: absolute;
    bottom: -16px;
    left: 8px;
  }
  .actions .btn-hover {
    position: static;
    opacity: 0;
  }
  .hover-container:hover .btn-hover {
    opacity: 1;
  }
  ::slotted([slot="type-badge"]) {
    position: absolute;
    top: -16px;
    left: -16px;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
  }
  .hover-container:hover ::slotted([slot="type-badge"]) {
    opacity: 0.6;
  }
`;
