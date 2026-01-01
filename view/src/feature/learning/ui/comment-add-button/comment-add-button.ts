import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";

@customElement("learning-comment-add-button")
export class LearningCommentAddButton extends LitElement {
  @property({ type: Boolean })
  isReply = false;

  @property({ attribute: false })
  onClick?: () => void;

  render() {
    return html`
      <button class="btn" @click=${() => this.onClick?.()}>
        <span class="material-symbols-outlined">add_comment</span>
        <span>${this.isReply ? "Reply" : "New Comment"}</span>
      </button>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .btn {
        color: var(--color-fg-muted);
        border: 1px dashed var(--color-border-default);
        width: 100%;
        justify-content: flex-start;
        background: transparent;
      }
      .btn:hover {
        background-color: var(--color-canvas-subtle);
        border-style: solid;
      }
    `,
  ];
}
