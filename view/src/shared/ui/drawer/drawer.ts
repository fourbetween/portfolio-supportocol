import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DrawerCloseEvent } from "../../event/drawer";
import { baseStyle } from "../../style/base";
import "../icons/icon-close";

@customElement("ui-drawer")
export class Drawer extends LitElement {
  @property({ type: Boolean, reflect: true })
  public open = false;

  @property({ type: String, reflect: true })
  public placement: "left" | "right" = "right";

  private close() {
    const activeElement = (this.shadowRoot?.activeElement ||
      document.activeElement) as HTMLElement;
    if (
      activeElement &&
      (this.renderRoot.contains(activeElement) || this.contains(activeElement))
    ) {
      activeElement.blur();
    }
    this.open = false;
    this.dispatchEvent(new DrawerCloseEvent());
  }

  private _handleBackdropClick() {
    this.close();
  }

  render() {
    return html`
      <div
        class="drawer-backdrop ${this.open ? "open" : ""}"
        @click=${this._handleBackdropClick}
        data-testid="drawer-backdrop"
      ></div>
      <div
        class="drawer-content ${this.open ? "open" : ""} ${this.placement}"
        role="dialog"
        aria-modal="true"
        .inert=${!this.open}
        data-testid="drawer-content"
      >
        <div class="drawer-header">
          <slot name="header"></slot>
          <button
            class="close-button"
            @click=${this.close}
            aria-label=${msg("Close")}
          >
            <ui-icon-close></ui-icon-close>
          </button>
        </div>
        <div class="drawer-body">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .drawer-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--color-overlay-backdrop);
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.3s ease,
          visibility 0.3s ease;
        z-index: 1000;
      }

      .drawer-backdrop.open {
        opacity: 1;
        visibility: visible;
      }

      .drawer-content {
        position: fixed;
        top: 0;
        width: 340px;
        height: 100%;
        background-color: var(--color-canvas-default);
        transition:
          transform 0.3s ease,
          visibility 0.3s ease;
        visibility: hidden;
        z-index: 1001;
        display: flex;
        flex-direction: column;
      }

      .drawer-content.right {
        right: 0;
        transform: translateX(100%);
        box-shadow: -2px 0 8px var(--color-shadow-medium);
      }

      .drawer-content.left {
        left: 0;
        transform: translateX(-100%);
        box-shadow: 2px 0 8px var(--color-shadow-medium);
      }

      .drawer-content.open {
        transform: translateX(0);
        visibility: visible;
      }

      .drawer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
        color: var(--color-fg-default);
      }

      .drawer-body {
        flex: 1;
        overflow-y: auto;
      }

      .close-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-fg-muted);
        border-radius: 4px;
      }

      .close-button:hover {
        color: var(--color-fg-default);
        background-color: var(--color-canvas-subtle);
      }
    `,
  ];
}
