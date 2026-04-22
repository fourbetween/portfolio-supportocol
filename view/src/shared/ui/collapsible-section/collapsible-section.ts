import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../style/base";

@customElement("ui-collapsible-section")
export class UiCollapsibleSection extends LitElement {
  @property({ type: Number })
  collapsedHeight = 200;

  @state()
  private _expanded = false;

  @state()
  private _overflow = false;

  private _resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  firstUpdated() {
    const content = this.shadowRoot?.querySelector(
      ".content",
    ) as HTMLElement | null;
    if (content) {
      this._resizeObserver?.observe(content);
    }
    const slot = this.shadowRoot?.querySelector(
      "slot",
    ) as HTMLSlotElement | null;
    slot?.addEventListener("slotchange", () => this._checkOverflow());
    this._checkOverflow();
  }

  private _checkOverflow() {
    const content = this.shadowRoot?.querySelector(
      ".content",
    ) as HTMLElement | null;
    if (content) {
      this._overflow = content.scrollHeight > this.collapsedHeight;
    }
  }

  private _toggle() {
    this._expanded = !this._expanded;
  }

  render() {
    const isCollapsed = !this._expanded && this._overflow;
    return html`
      <div
        class="content${isCollapsed ? " collapsed" : ""}"
        style=${isCollapsed ? `max-height: ${this.collapsedHeight}px` : ""}
      >
        <slot></slot>
      </div>
      ${this._overflow
        ? html`
            <div class="toggle-container">
              <button class="toggle-btn" @click=${this._toggle}>
                ${this._expanded ? msg("Show less") : msg("Show more")}
              </button>
            </div>
          `
        : html``}
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }

      .content {
        overflow: hidden;
        position: relative;
      }

      .content.collapsed::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 32px;
        background: linear-gradient(transparent, var(--color-canvas-default));
        pointer-events: none;
      }

      .toggle-container {
        display: flex;
        justify-content: flex-end;
      }

      .toggle-btn {
        display: inline-flex;
        align-items: center;
        margin-top: 4px;
        padding: 0;
        background: none;
        border: none;
        color: var(--color-accent-fg);
        font-size: 13px;
        cursor: pointer;
        line-height: 20px;
      }

      .toggle-btn:hover {
        text-decoration: underline;
      }
    `,
  ];
}
