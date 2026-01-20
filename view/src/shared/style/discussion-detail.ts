import { css } from "lit";

export const discussionDetailStyle = css`
  .container {
    padding: 8px 0;
    background-color: var(--color-canvas-default);
  }

  .badge-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .theme-row {
    padding-top: 8px;
  }

  .theme {
    font-size: 16px;
    font-weight: 400;
    margin: 0;
  }

  .conclusion-row {
    margin-top: 8px;
    padding-top: 8px;
  }

  .conclusion {
    font-size: 14px;
    margin: 0;
    white-space: pre-wrap;
    padding-bottom: 8px;
  }
`;
