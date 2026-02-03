import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentCardStyle } from "../../../../shared/style/comment-card";
import { iconStyle } from "../../../../shared/style/icon";
import { DialogueCommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";

@customElement("dialogue-comment-card")
export class DialogueCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Boolean })
  archived = false;

  private _handleClick() {
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  render() {
    if (!this.comment) return html``;

    const isArchivedForStyle = this.archived || !!this.comment.archivedAt;
    const isSelfArchived = !!this.comment.archivedAt;

    return html`
      <div
        class=${classMap(this._cardClasses(isArchivedForStyle))}
        @click=${this._handleClick}
      >
        <div class="content">${this.comment.content}</div>
        <div class="footer">
          ${isSelfArchived
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

  private _cardClasses(isArchived: boolean) {
    return {
      "card-body": true,
      proposed: this.comment?.status === "proposed",
      archived: isArchived,
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
      .card-body {
        cursor: pointer;
      }
      .issue-icon {
        font-size: 16px;
        color: var(--color-error, #d32f2f);
        cursor: pointer;
      }
      .issue-icon:hover {
        opacity: 0.8;
      }
    `,
  ];
}
