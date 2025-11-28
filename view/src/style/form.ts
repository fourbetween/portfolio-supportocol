import { type CSSResultGroup, css } from "lit";

export const formStyle: CSSResultGroup = [
  css`
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .form-label,
    label {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-fg-default);
    }

    .form-control,
    input[type="text"],
    textarea,
    select {
      padding: 8px 12px;
      font-size: 14px;
      border: 1px solid var(--color-border-default);
      border-radius: 6px;
      background-color: var(--color-canvas-default);
      color: var(--color-fg-default);
    }

    .form-control:focus,
    input[type="text"]:focus,
    textarea:focus,
    select:focus {
      outline: none;
      border-color: var(--color-accent-fg);
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
    }

    textarea,
    textarea.form-control {
      min-height: 80px;
      resize: vertical;
    }

    .color-picker {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .color-option {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      padding: 0;
    }

    .color-option:hover {
      transform: scale(1.1);
    }

    .color-option.selected {
      border-color: var(--color-fg-default);
      transform: scale(1.1);
    }
  `,
];
