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
`;
