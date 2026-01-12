import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../style/base";

@customElement("ui-comment-type-badge")
export class CommentTypeBadge extends LitElement {
  @property({ type: String })
  type = "";

  @property({ type: Boolean })
  active = false;

  @property({ type: Boolean })
  clickable = false;

  render() {
    if (!this.type) return nothing;

    const classes = {
      "type-label": true,
      active: this.active,
      clickable: this.clickable,
    };

    return html`
      <div class=${classMap(classes)}>${this.type}</div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: inline-block;
      }
      .type-label {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        color: var(--color-accent-fg);
        background-color: rgba(9, 105, 218, 0.1);
        border: 1px solid rgba(9, 105, 218, 0.2);
        border-radius: 2em;
        white-space: nowrap;
        transition: all 0.2s ease-in-out;
      }
      .type-label.clickable {
        cursor: pointer;
      }
      .type-label.clickable:hover {
        background-color: rgba(9, 105, 218, 0.2);
        border-color: rgba(9, 105, 218, 0.4);
      }
      .type-label.active {
        color: var(--color-fg-on-emphasis);
        background-color: var(--color-accent-emphasis);
        border-color: var(--color-accent-emphasis);
      }
    `,
  ];
}
