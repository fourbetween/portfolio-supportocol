import { type CSSResultGroup, css } from "lit";

export const ruleFormPageStyle: CSSResultGroup = css`
  :host {
    display: block;
    min-height: 100vh;
    background-color: var(--color-canvas-default);
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--color-fg-default);
    margin: 0 0 24px 0;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
`;
