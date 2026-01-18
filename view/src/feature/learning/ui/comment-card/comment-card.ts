import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentCardStyle } from "../../../../shared/style/comment-card";
import { iconStyle } from "../../../../shared/style/icon";
import { LearningCommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";

@customElement("learning-comment-card")
export class LearningCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  private _handleClick() {
    this.dispatchEvent(new LearningCommentSelectEvent(this.comment?.id));
  }

  render() {
    if (!this.comment) return html``;

    return html`
      <div class=${classMap(this._cardClasses)} @click=${this._handleClick}>
        <div class="content">${this.comment.content}</div>
        <div class="footer">
          ${this.comment.archivedAt
            ? html`
                <span class="material-symbols-outlined archived-icon">
                  archive
                </span>
              `
            : nothing}
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
      archived: !!this.comment?.archivedAt,
    };
  }

  private _formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  static styles = [
    baseStyle,
    commentCardStyle,
    iconStyle,
    css`
      :host {
        cursor: pointer;
      }
      .archived-icon {
        font-size: 16px;
        color: var(--color-fg-muted);
      }
      .card-body.archived {
        opacity: 0.6;
        background-color: var(--color-canvas-subtle);
      }
    `,
  ];
}
