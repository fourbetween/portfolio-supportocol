import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Comment, CommentType } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { cardStyle } from "../../../style/card";

@customElement("comment-treeitem-presenter")
export class CommentTreeitemPresenter extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Object })
  commentType?: CommentType;

  render() {
    if (!this.comment) return html``;

    const badgeStyle = this.commentType
      ? `background-color: ${this.commentType.color}`
      : "background-color: #0969da";
    const badgeName = this.commentType ? this.commentType.name : "Type";

    return html`
      <div class="card">
        <div class="card-header">
          <div>
            <span class="comment-type-badge" style="${badgeStyle}">
              ${badgeName}
            </span>
            <strong>${this.comment.postedBy}</strong>
            が投稿 • ${this.comment.postedAt}
          </div>
          <div>#${this.comment.id}</div>
        </div>
        <div class="card-body">
          <p>${this.comment.content}</p>
        </div>
        <div class="card-footer">
          <a href="#" class="btn btn-sm">返信</a>
          <a href="#" class="btn btn-sm">指摘</a>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    cardStyle,
    css`
      .card {
        position: relative;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--color-fg-muted);
      }

      .comment-type-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #fff;
        margin-right: 8px;
      }

      .card-body {
        font-size: 14px;
      }

      .card-footer {
        display: flex;
        gap: 8px;
      }
    `,
  ];
}
