import { type CSSResultGroup, css } from "lit";

export const formStyle: CSSResultGroup = [
  css`
    .form-group {
      margin-bottom: 16px;
    }

    .form-label {
      display: block;
      font-weight: 600;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 5px 12px;
      font-size: 14px;
      line-height: 20px;
      border: 1px solid var(--color-border-default);
      border-radius: 6px;
      box-sizing: border-box;
      background-color: var(--color-canvas-default);
      color: var(--color-fg-default);
    }

    .form-control:focus {
      border-color: var(--color-accent-fg);
      outline: none;
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
    }

    textarea.form-control {
      min-height: 120px;
      resize: vertical;
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%2324292f' d='M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      padding-right: 32px;
    }

    .form-helper {
      font-size: 12px;
      color: var(--color-fg-muted);
      margin-top: 4px;
    }
  `,
];
