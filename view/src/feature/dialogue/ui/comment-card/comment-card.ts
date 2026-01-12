import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentCardStyle } from "../../../../shared/style/comment-card";
import { DialogueCommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";

@customElement("dialogue-comment-card")
export class DialogueCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  private _handleClick() {
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  render() {
    if (!this.comment) return html``;

    return html`
      <div class=${classMap(this._cardClasses)} @click=${this._handleClick}>
        <div class="content">${this.comment.content}</div>
        <div class="footer">
          ${this.activeChildrenCount > 0
            ? html`
                <div class="child-count">${this.activeChildrenCount}</div>
              `
            : nothing}
          <div class="created-at">
            ${this._formatDate(this.comment.createdAt)}
          </div>
        </div>
      </div>
    `;
  }

  private get _cardClasses() {
    return {
      "card-body": true,
      proposed: this.comment?.status === "proposed",
    };
  }

  private _formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  static styles = [
    baseStyle,
    commentCardStyle,
    css`
      .card-body {
        cursor: pointer;
      }
    `,
  ];
}
