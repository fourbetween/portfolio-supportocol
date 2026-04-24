import { css } from "lit";

export const commentTreeStickyHeaderHeightPx = 32;

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
    margin-bottom: 0;
    position: sticky;
    background: var(--color-canvas-default);
    padding: 4px 0;
    min-height: ${commentTreeStickyHeaderHeightPx}px;
    box-sizing: border-box;
    overflow: hidden;
    cursor: default;
    pointer-events: none;
  }
  .group-header.stuck {
    cursor: pointer;
    pointer-events: auto;
  }
  .group-header:focus-visible {
    outline: 2px solid var(--color-accent-fg);
    outline-offset: 2px;
  }
  .sticky-sentinel {
    height: 1px;
    visibility: hidden;
    pointer-events: none;
    margin: 0;
    padding: 0;
  }
  .parent-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: var(--color-fg-muted);
    line-height: 1.4;
    opacity: 0;
  }
  .group-header.stuck .parent-content {
    opacity: 1;
  }
  .group-content {
    margin-left: 6px;
    padding-left: 6px;
    border-left: 2px solid var(--color-accent-fg);
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
  .tree {
    padding-bottom: 150px;
  }
`;
