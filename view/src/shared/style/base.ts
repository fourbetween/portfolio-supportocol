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
    }
  `,
];
