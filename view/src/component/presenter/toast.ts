import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../style/base";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@customElement("toast-presenter")
export class ToastPresenter extends LitElement {
  @state()
  private toasts: ToastMessage[] = [];

  @property({ type: Number })
  defaultDuration = 5000;

  private timeouts = new Map<string, number>();

  show(message: string, type: ToastType = "info", duration?: number) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: duration ?? this.defaultDuration,
    };

    this.toasts = [...this.toasts, toast];
    this.scheduleRemoval(toast);
  }

  private scheduleRemoval(toast: ToastMessage) {
    if (toast.duration && toast.duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
      this.timeouts.set(toast.id, timeoutId);
    }
  }

  private removeToast(id: string) {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  private getIcon(type: ToastType) {
    switch (type) {
      case "success":
        return html`
          <svg
            class="toast-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
            ></path>
          </svg>
        `;
      case "error":
        return html`
          <svg
            class="toast-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
            ></path>
          </svg>
        `;
      case "warning":
        return html`
          <svg
            class="toast-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0114.082 15H1.918a1.75 1.75 0 01-1.543-2.575zm1.763.707a.25.25 0 00-.44 0L1.698 13.132a.25.25 0 00.22.368h12.164a.25.25 0 00.22-.368zm.53 3.996v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 011.5 0zM9 11a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        `;
      case "info":
      default:
        return html`
          <svg
            class="toast-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            width="16"
            height="16"
          >
            <path
              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
            ></path>
          </svg>
        `;
    }
  }

  render() {
    return html`
      <div class="toast-container">
        ${this.toasts.map(
          (toast) => html`
            <div class="toast toast-${toast.type}" role="alert">
              ${this.getIcon(toast.type)}
              <span class="toast-message">${toast.message}</span>
              <button
                class="toast-close"
                @click=${() => this.removeToast(toast.id)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }

      .toast-container {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 400px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 8px 24px rgba(140, 149, 159, 0.2);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-icon {
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        color: var(--color-fg-default);
        font-size: 14px;
        line-height: 1.5;
      }

      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 20px;
        color: var(--color-fg-muted);
        padding: 0;
        width: 20px;
        height: 20px;
        line-height: 1;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toast-close:hover {
        color: var(--color-fg-default);
        background-color: var(--color-canvas-subtle);
      }

      .toast-success .toast-icon {
        fill: #1a7f37;
      }

      .toast-success {
        border-color: #1a7f37;
        background-color: #dafbe1;
      }

      .toast-error .toast-icon {
        fill: #cf222e;
      }

      .toast-error {
        border-color: #cf222e;
        background-color: #ffebe9;
      }

      .toast-warning .toast-icon {
        fill: #bf8700;
      }

      .toast-warning {
        border-color: #bf8700;
        background-color: #fff8c5;
      }

      .toast-info .toast-icon {
        fill: #0969da;
      }

      .toast-info {
        border-color: #0969da;
        background-color: #ddf4ff;
      }
    `,
  ];
}
