import { css } from "lit";

export const commentItemStyle = css`
  :host {
    display: block;
    position: relative;
  }

  .card-wrapper {
    position: relative;
  }

  ::slotted([slot="type-badge"]) {
    position: absolute;
    top: -16px;
    left: -16px;
    z-index: 10;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }
  .card-wrapper:hover ::slotted([slot="type-badge"]) {
    opacity: 0.6;
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
    ::slotted([slot="type-badge"]) {
      opacity: 0.6;
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
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
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
`;
