import { type CSSResultGroup, css } from "lit";

export const inputStyle: CSSResultGroup = css`
  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  textarea {
    padding: 5px 12px;
    font-size: 14px;
    line-height: 20px;
    color: var(--color-fg-default);
    background-color: var(--color-canvas-default);
    border: 1px solid var(--color-border-default);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  input:focus,
  textarea:focus {
    border-color: var(--color-accent-fg);
    box-shadow: inset 0 0 0 1px var(--color-accent-fg);
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--color-fg-muted);
  }
`;
