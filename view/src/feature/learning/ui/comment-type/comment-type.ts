import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";

@customElement("learning-comment-type")
export class LearningCommentType extends LitElement {
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
        display: block;
      }
      .type-label {
        font-size: 12px;
        font-weight: bold;
        color: var(--color-fg-muted);
        margin-bottom: 4px;
        text-transform: uppercase;
      }
    `,
  ];
}
