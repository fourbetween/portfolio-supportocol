import { css } from "lit";

export const commentTreeStyle = css`
  .comment-node {
    margin-bottom: 16px;
  }
  .children {
    margin-left: 8px;
  }
  .child-group {
    margin-top: 12px;
    margin-bottom: 12px;
  }
  .group-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .group-content {
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px dashed var(--color-border-muted);
  }
  .controls {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
  }
  .show-archived {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    color: var(--color-fg-muted);
    cursor: pointer;
    user-select: none;
  }
`;
