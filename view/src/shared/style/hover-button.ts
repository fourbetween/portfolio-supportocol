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
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    z-index: 100;
    overflow: hidden;
  }

  .btn-hover.attention {
    opacity: 1;
    color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
    animation: btn-hover-attention 1.4s ease-in-out infinite;
  }

  .btn-hover.attention:hover {
    color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
  }

  .btn-hover:hover {
    background: var(--color-canvas-subtle);
    color: var(--color-accent-fg);
    border-color: var(--color-accent-fg);
  }

  .btn-hover.primary {
    color: var(--color-btn-primary-bg);
  }

  .btn-hover.primary:hover {
    color: var(--color-btn-primary-bg);
    border-color: var(--color-btn-primary-bg);
  }

  .btn-hover.danger {
    color: var(--color-danger-fg);
  }

  .btn-hover.danger:hover {
    color: var(--color-danger-fg);
    border-color: var(--color-danger-fg);
  }

  .btn-hover.success {
    color: var(--color-success-fg);
  }

  .btn-hover.success:hover {
    color: var(--color-success-fg);
    border-color: var(--color-success-fg);
  }

  /* Container hover trigger */
  .hover-container:hover .btn-hover {
    opacity: 1;
  }

  @keyframes btn-hover-attention {
    0%,
    100% {
      background: var(--color-canvas-default);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }

    50% {
      background: rgba(9, 105, 218, 0.12);
      box-shadow: 0 0 0 4px rgba(9, 105, 218, 0.18);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .btn-hover.attention {
      animation: none;
      background: rgba(9, 105, 218, 0.08);
    }
  }
`;
