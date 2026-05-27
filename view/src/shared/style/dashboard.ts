import { css } from "lit";

export const dashboardStyle = css`
  :host {
    display: block;
    height: 100%;
  }

  .dashboard {
    display: flex;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .sidebar {
    width: 300px;
    overflow-y: auto;
    background-color: var(--color-canvas-default);
  }

  .sidebar-left {
    border-right: 1px solid var(--color-border-default);
  }

  .sidebar-right {
    border-left: 1px solid var(--color-border-default);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .main {
    flex: 1;
    display: flex;
    gap: 16px;
    flex-direction: column;
    overflow-y: auto;
    padding-bottom: 24px;
    background-color: var(--color-canvas-default);
  }

  .detail,
  .comment-frame,
  .comment-explorer {
    padding: 0 16px;
  }

  .detail {
    border-bottom: 1px solid var(--color-border-default);
  }

  .btn-hover {
    width: 48px;
    height: 48px;
  }

  .btn-left {
    left: 16px;
    bottom: 16px; /* fallback */
    bottom: calc(16px + env(safe-area-inset-bottom));
  }

  .btn-right {
    right: 16px;
    bottom: 16px; /* fallback */
    bottom: calc(16px + env(safe-area-inset-bottom));
  }

  @media (hover: none) {
    .btn-hover {
      opacity: 1;
    }
  }
`;
