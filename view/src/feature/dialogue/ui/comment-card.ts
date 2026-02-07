import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../shared/style/base";
import { commentCardStyle } from "../../../shared/style/comment-card";
import { iconStyle } from "../../../shared/style/icon";
import { DialogueCommentSelectEvent } from "../event/comment";
import type { Comment } from "../model/comment";
import "./issue-list-popup";

@customElement("dialogue-comment-card")
export class DialogueCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Boolean })
  archived = false;

  @property({ type: Boolean })
  readonly = false;

  @state()
  private _isIssuePopupOpen = false;

  private _handleClick() {
    if (this.readonly) return;
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  private _handleIssueClick(e: Event) {
    if (this.readonly) return;
    e.stopPropagation();
    this._isIssuePopupOpen = true;
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
          ${this.comment.issues && this.comment.issues.length > 0
            ? html`
                <span
                  class="material-symbols-outlined issue-icon"
                  @click=${this._handleIssueClick}
                >
                  warning
                </span>
              `
            : nothing}
        </div>
      </div>
      ${this.comment.issues && this.comment.issues.length > 0
        ? html`
            <dialogue-issue-list-popup
              .open=${this._isIssuePopupOpen}
              .issues=${this.comment.issues ?? []}
              @popup-closed=${() => (this._isIssuePopupOpen = false)}
            ></dialogue-issue-list-popup>
          `
        : nothing}
    `;
  }

  private _cardClasses(isArchived: boolean) {
    return {
      "card-body": true,
      proposed: this.comment?.status === "proposed",
      archived: isArchived,
      readonly: this.readonly,
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
      .card-body.readonly {
        cursor: default;
      }
      .issue-icon {
        font-size: 16px;
        color: var(--color-error, #d32f2f);
        cursor: pointer;
      }
      .card-body.readonly .issue-icon {
        cursor: default;
      }
      .issue-icon:hover {
        opacity: 0.8;
      }
      .card-body.readonly .issue-icon:hover {
        opacity: 1;
      }
    `,
  ];
}
