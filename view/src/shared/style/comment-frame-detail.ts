import { css } from "lit";

export const commentFrameDetail = css`
  .container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .paths {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .path-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .parent-node {
    align-self: flex-start;
  }
  .children-nodes {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-left: 8px;
    padding-left: 16px;
    border-left: 1px dashed var(--color-border-muted);
    margin-top: 4px;
  }
  .child-node {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;
