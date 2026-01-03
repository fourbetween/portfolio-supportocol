import { css } from "lit";

export const hoverButtonStyle = css`
  .btn-hover {
    position: absolute;
    background: var(--color-canvas-default);
    color: var(--color-fg-muted);
    border: 1px solid var(--color-border-default);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: all 0.1s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    z-index: 1;
  }

  .btn-hover:hover {
    background: var(--color-canvas-subtle);
    color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
  }

  .btn-hover.primary:hover {
    color: var(--color-btn-primary-bg);
    border-color: var(--color-btn-primary-bg);
  }

  .btn-hover.danger:hover {
    color: var(--color-danger-fg);
    border-color: var(--color-danger-fg);
  }

  /* Container hover trigger */
  .hover-container:hover .btn-hover {
    opacity: 1;
  }
`;
