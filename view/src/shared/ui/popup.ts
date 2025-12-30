import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { baseStyle } from "../style/base";
import { buttonStyle } from "../style/button";

@customElement("ui-popup")
export class Popup extends LitElement {
  @query("dialog")
  private dialog!: HTMLDialogElement;

  render() {
    return html`
      <dialog>
        <div class="header">
          <slot name="header"></slot>
          <button
            class="close-button btn"
            @click=${this.close}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div class="main">
          <slot name="main"></slot>
        </div>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </dialog>
    `;
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      dialog {
        border: none;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
        padding: 0;
        width: 100%;
        max-width: 640px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.4);
      }
      .header {
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }
      .main {
        padding: 16px;
      }
      .footer {
        padding: 16px;
        border-top: 1px solid var(--color-border-default);
        background-color: var(--color-canvas-subtle);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }
      .close-button {
        padding: 4px;
        line-height: 1;
        border-radius: 4px;
        border: none;
        background: none;
        font-size: 20px;
        color: var(--color-fg-muted);
      }
      .close-button:hover {
        color: var(--color-fg-default);
        background-color: var(--color-canvas-subtle);
      }
    `,
  ];
}
