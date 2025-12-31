import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";

@customElement("learning-comment-type-badge")
export class LearningCommentTypeBadge extends LitElement {
  @property({ type: String })
  type = "";

  render() {
    if (!this.type) return html``;
    return html`
      <div class="type-label">${this.type}</div>
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
      }
    `,
  ];
}
