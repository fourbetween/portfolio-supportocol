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
    right: 8px;
  }
  .actions .btn-hover {
    position: static;
    opacity: 0;
  }
  .hover-container:hover .btn-hover {
    opacity: 1;
  }
`;
