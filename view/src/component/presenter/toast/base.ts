import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

@customElement("base-toast-presenter")
export class BaseToastPresenter extends LitElement {
  @state()
  private visible = false;

  @state()
  private message = "";

  @state()
  private type: ToastType = "info";

  private timeoutId: number | null = null;

  render() {
    if (!this.visible) {
      return html``;
    }
    return html`
      <div class="toast ${this.type}" role="alert">
        <span class="message">${this.message}</span>
        <button class="close-button" @click=${this.hide} aria-label="閉じる">
          ×
        </button>
      </div>
    `;
  }

  show(options: ToastOptions) {
    this.message = options.message;
    this.type = options.type;
    this.visible = true;

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    if (options.duration) {
      this.timeoutId = window.setTimeout(() => {
        this.hide();
      }, options.duration);
    }
  }

  hide() {
    this.visible = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  static styles = [
    baseStyle,
    css`
      :host {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 1000;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        color: var(--color-fg-default);
      }

      .toast.success {
        border-left: 4px solid var(--color-btn-primary-bg);
      }

      .toast.error {
        border-left: 4px solid var(--color-danger-fg);
      }

      .toast.info {
        border-left: 4px solid var(--color-accent-fg);
      }

      .toast.warning {
        border-left: 4px solid #bf8700;
      }

      .message {
        font-size: 14px;
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 16px;
        color: var(--color-fg-muted);
        padding: 0;
        line-height: 1;
        flex-shrink: 0;
      }

      .close-button:hover {
        color: var(--color-fg-default);
      }
    `,
  ];
}
