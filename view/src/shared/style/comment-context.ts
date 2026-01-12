import { css } from "lit";

export const commentContextStyle = css`
  .container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  learning-comment-card {
    cursor: pointer;
  }
  .separator {
    display: flex;
    justify-content: center;
    color: var(--color-fg-muted);
    margin: 4px 0;
  }
  .material-symbols-outlined {
    font-size: 20px;
  }
`;
