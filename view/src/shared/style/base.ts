import { type CSSResultGroup, css } from "lit";

export const baseStyle: CSSResultGroup = [
  css`
    :host {
      display: block;

      --color-fg-default: #24292f;
      --color-fg-muted: #57606a;
      --color-canvas-default: #ffffff;
      --color-canvas-subtle: #f6f8fa;
      --color-canvas-inset: #eff3f6;
      --color-border-default: #d0d7de;
      --color-border-muted: #d8dee4;
      --color-accent-fg: #0969da;
      --color-accent-muted: rgba(9, 105, 218, 0.12);
      --color-accent-subtle: rgba(9, 105, 218, 0.18);
      --color-accent-faint: rgba(9, 105, 218, 0.08);
      --color-btn-bg: #f6f8fa;
      --color-btn-text: #24292f;
      --color-btn-hover-bg: #f3f4f6;
      --color-btn-primary-bg: #2da44e;
      --color-btn-primary-text: #ffffff;
      --color-btn-primary-hover-bg: #2c974b;
      --color-btn-primary-border: rgba(27, 31, 36, 0.15);
      --color-header-bg: #24292f;
      --color-header-text: #ffffff;
      --color-danger-fg: #cf222e;
      --color-success-fg: #1a7f37;
      --color-success-muted: rgba(26, 127, 55, 0.15);
      --color-success-subtle: rgba(26, 127, 55, 0.05);
      --color-neutral-muted: rgba(175, 184, 193, 0.2);
      --color-neutral-subtle: rgba(175, 184, 193, 0.05);
      --color-shadow-default: rgba(0, 0, 0, 0.08);
      --color-shadow-medium: rgba(0, 0, 0, 0.15);
      --color-shadow-large: rgba(0, 0, 0, 0.12);
      --color-popup-shadow: rgba(140, 149, 159, 0.2);
      --color-overlay-backdrop: rgba(0, 0, 0, 0.5);
      --color-overlay-loading: rgba(0, 0, 0, 0.3);
      --color-hover-overlay: rgba(255, 255, 255, 0.1);
      --color-disabled-btn-bg: #94d3a2;
      --color-warning-fg: #bf8700;
      --color-fg-on-emphasis: #ffffff;
      --color-accent-emphasis: #0969da;
      --color-danger-bg: #ffebe9;
      --color-danger-border: rgba(255, 129, 130, 0.4);
      --color-danger-zone-bg: #fff0f0;
      --color-loading-overlay: rgba(255, 255, 255, 0.7);
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --color-fg-default: #e6edf3;
        --color-fg-muted: #8b949e;
        --color-canvas-default: #22272e;
        --color-canvas-subtle: #2d333b;
        --color-canvas-inset: #181c20;
        --color-border-default: #444c56;
        --color-border-muted: #373e47;
        --color-accent-fg: #539bf5;
        --color-accent-muted: rgba(83, 155, 245, 0.15);
        --color-accent-subtle: rgba(83, 155, 245, 0.25);
        --color-accent-faint: rgba(83, 155, 245, 0.1);
        --color-btn-bg: #2d333b;
        --color-btn-text: #e6edf3;
        --color-btn-hover-bg: #373e47;
        --color-btn-primary-bg: #34d058;
        --color-btn-primary-text: #ffffff;
        --color-btn-primary-hover-bg: #2ea44f;
        --color-btn-primary-border: rgba(240, 246, 252, 0.1);
        --color-header-bg: #2d333b;
        --color-header-text: #e6edf3;
        --color-danger-fg: #f47067;
        --color-success-fg: #57ab5a;
        --color-success-muted: rgba(87, 171, 90, 0.15);
        --color-success-subtle: rgba(87, 171, 90, 0.05);
        --color-neutral-muted: rgba(99, 110, 123, 0.4);
        --color-neutral-subtle: rgba(110, 118, 129, 0.1);
        --color-shadow-default: rgba(0, 0, 0, 0.3);
        --color-shadow-medium: rgba(0, 0, 0, 0.5);
        --color-shadow-large: rgba(0, 0, 0, 0.5);
        --color-popup-shadow: rgba(0, 0, 0, 0.4);
        --color-overlay-backdrop: rgba(0, 0, 0, 0.7);
        --color-overlay-loading: rgba(0, 0, 0, 0.6);
        --color-hover-overlay: rgba(255, 255, 255, 0.08);
        --color-disabled-btn-bg: #234031;
        --color-warning-fg: #d29922;
        --color-fg-on-emphasis: #ffffff;
        --color-accent-emphasis: #539bf5;
        --color-danger-bg: rgba(248, 81, 73, 0.15);
        --color-danger-border: rgba(248, 81, 73, 0.4);
        --color-danger-zone-bg: rgba(248, 81, 73, 0.1);
        --color-loading-overlay: rgba(34, 39, 46, 0.7);
      }
    }

    * {
      box-sizing: border-box;
      font-family: "Noto Sans JP", "Noto Sans", sans-serif;
    }

    span {
      overflow-wrap: break-word;
    }

    p {
      margin: 0;
      color: var(--color-fg-default);
    }
  `,
];
