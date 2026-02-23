import { css } from "lit";

export const widgetStyle = css`
  .container {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .container-tight {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .section-header .section-title {
    margin-bottom: 0;
  }
  .loading {
    padding: 24px;
    text-align: center;
    color: var(--color-fg-muted);
  }
  .clear-button {
    background: none;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    color: var(--color-fg-muted);
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    font-size: 12px;
  }
  .clear-button:hover {
    background-color: var(--color-canvas-subtle);
    color: var(--color-fg-default);
  }
  .clear-button .material-symbols-outlined {
    font-size: 16px;
  }
`;
