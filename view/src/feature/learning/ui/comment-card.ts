import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../shared/style/base";
import { commentCardStyle } from "../../../shared/style/comment-card";
import "../../../shared/ui/icons/icon-archive";
import "../../../shared/ui/icons/icon-warning";
import { LearningCommentSelectEvent } from "../event/comment";
import type { Comment } from "../model/comment";
import "./issue-list-popup";

@customElement("learning-comment-card")
export class LearningCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Boolean })
  archived = false;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  clickable = false;

  @state()
  private _isIssuePopupOpen = false;

  private _handleClick() {
    if (this.readonly) return;
    if (!this.clickable) return;
    this.dispatchEvent(new LearningCommentSelectEvent(this.comment?.id));
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
                <ui-icon-archive class="archived-icon"></ui-icon-archive>
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
                <ui-icon-warning
                  class="issue-icon"
                  @click=${this._handleIssueClick}
                ></ui-icon-warning>
              `
            : nothing}
        </div>
      </div>
      ${this.comment.issues && this.comment.issues.length > 0
        ? html`
            <learning-issue-list-popup
              .open=${this._isIssuePopupOpen}
              .commentId=${this.comment.id}
              .issues=${this.comment.issues ?? []}
              .readonly=${this.readonly}
              @popup-closed=${() => (this._isIssuePopupOpen = false)}
            ></learning-issue-list-popup>
          `
        : nothing}
    `;
  }

  private _cardClasses(isArchived: boolean) {
    return {
      "card-body": true,
      clickable: this.clickable,
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
    css`
      :host {
        cursor: default;
      }
      .card-body.clickable {
        cursor: pointer;
      }
      .card-body.readonly {
        cursor: default;
      }
      .issue-icon {
        font-size: 16px;
        color: var(--color-danger-fg);
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
