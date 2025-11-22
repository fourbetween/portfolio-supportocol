import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Comment, CommentType } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";

@customElement("comment-presenter")
export class CommentPresenter extends LitElement {
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
      <div class="comment-card">
        <div class="comment-header">
          <div>
            <span class="comment-type-badge" style="${badgeStyle}">
              ${badgeName}
            </span>
            <strong>${this.comment.postedBy}</strong>
            が投稿 • ${this.comment.postedAt}
          </div>
          <div>#${this.comment.id}</div>
        </div>
        <div class="comment-body">
          <p>${this.comment.content}</p>
        </div>
        <div class="comment-footer">
          <a href="#" class="btn btn-sm">返信</a>
          <a href="#" class="btn btn-sm">指摘</a>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .comment-card {
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 16px;
        position: relative;
      }

      .comment-header {
        padding: 8px 16px;
        background-color: var(--color-canvas-subtle);
        border-bottom: 1px solid var(--color-border-default);
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
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

      .comment-body {
        padding: 16px;
        font-size: 14px;
      }

      .comment-footer {
        padding: 8px 16px;
        border-top: 1px solid var(--color-border-muted);
        display: flex;
        gap: 8px;
      }

      .btn {
        display: inline-block;
        padding: 5px 16px;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        white-space: nowrap;
        vertical-align: middle;
        cursor: pointer;
        user-select: none;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
        text-decoration: none;
      }

      .btn:hover {
        background-color: #f3f4f6;
        border-color: var(--color-border-muted);
      }

      .btn-sm {
        padding: 3px 12px;
        font-size: 12px;
      }
    `,
  ];
}
