import { css } from "lit";

export const commentItemStyle = css`
  :host {
    display: block;
    position: relative;
  }

  .card-wrapper {
    position: relative;
  }

  .toolbar {
    position: absolute;
    top: -14px;
    right: 8px;
    display: flex;
    gap: 4px;
    z-index: 11;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .card-wrapper:hover .toolbar {
    opacity: 1;
  }
  @media (hover: none) {
    .toolbar {
      opacity: 1;
    }
  }

  .toolbar-btn {
    background: var(--color-canvas-default);
    color: var(--color-fg-muted);
    border: 1px solid var(--color-border-default);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 1px 3px var(--color-shadow-default);
    padding: 0;
  }
  .toolbar-btn:hover {
    background: var(--color-canvas-subtle);
    color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
  }
  .toolbar-btn.danger {
    color: var(--color-danger-fg);
  }
  .toolbar-btn.danger:hover {
    border-color: var(--color-danger-fg);
  }

  .toolbar.is-open {
    opacity: 1;
    z-index: 50;
  }

  .more-wrapper {
    position: relative;
  }

  .menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .action-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    z-index: 100;
    background: var(--color-canvas-default);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    box-shadow: 0 4px 16px var(--color-shadow-large);
    min-width: 160px;
    padding: 4px 0;
    display: flex;
    flex-direction: column;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: none;
    color: var(--color-fg-default);
    font-size: 13px;
    cursor: pointer;
    white-space: nowrap;
    text-align: left;
    transition: background 0.1s;
  }
  .menu-item:hover {
    background: var(--color-canvas-subtle);
  }

  .menu-item.danger {
    color: var(--color-danger-fg);
  }
`;
