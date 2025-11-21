import { type CSSResultGroup, css } from "lit";

export const baseStyle: CSSResultGroup = [
  css`
    :root {
      --color-fg-default: #24292f;
      --color-fg-muted: #57606a;
      --color-canvas-default: #ffffff;
      --color-canvas-subtle: #f6f8fa;
      --color-border-default: #d0d7de;
      --color-border-muted: #d8dee4;
      --color-accent-fg: #0969da;
      --color-btn-primary-bg: #2da44e;
      --color-btn-primary-text: #ffffff;
      --color-btn-primary-hover-bg: #2c974b;
      --color-header-bg: #24292f;
      --color-header-text: #ffffff;
      --color-danger-fg: #cf222e;
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
