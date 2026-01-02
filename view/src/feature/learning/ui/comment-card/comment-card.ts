import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import type { Comment } from "../../model/comment";

@customElement("learning-comment-card")
export class LearningCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  render() {
    if (!this.comment) return html``;

    return html`
      <div class="content">${this.comment.content}</div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        overflow: hidden;
        position: relative;
      }

      .content {
        padding: 16px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--color-fg-default);
      }
    `,
  ];
}
