import { type CSSResultGroup, css } from "lit";

export const baseStyle: CSSResultGroup = [
  css`
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
