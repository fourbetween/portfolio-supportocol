import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import type { BasePopupPresenter } from "./base";

@customElement("confirm-popup-presenter")
export class ConfirmPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @property({ type: String })
  title = "";

  @property({ type: String })
  message = "";

  @property({ type: String })
  confirmLabel = "確認";

  @property({ type: String })
  cancelLabel = "キャンセル";

  @property({ attribute: false })
  onConfirm?: () => void;

  @property({ attribute: false })
  onCancel?: () => void;

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">${this.title}</span>
        <div slot="main">
          <p class="message">${this.message}</p>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            ${this.cancelLabel}
          </button>
          <button class="btn-danger" @click=${this.handleConfirm}>
            ${this.confirmLabel}
          </button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  private handleConfirm() {
    this.onConfirm?.();
  }

  private handleCancel() {
    this.onCancel?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .message {
        font-size: 14px;
        color: var(--color-fg-default);
        margin: 0;
        line-height: 1.5;
      }

      .btn-danger {
        padding: 8px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-btn-primary-text);
        background-color: var(--color-danger-fg);
        border: 1px solid var(--color-danger-fg);
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-danger:hover {
        background-color: var(--color-danger-emphasis);
      }
    `,
  ];
}
