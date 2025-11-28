import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type {
  Comment,
  CommentType,
  Discussion,
} from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  listItemStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
  sectionStyle,
} from "../../../../style/page";

@customElement("item-discussion-page-presenter")
export class ItemDiscussionPagePresenter extends LitElement {
  @property({ attribute: false })
  discussion?: Discussion;

  @property({ attribute: false })
  comments: Comment[] = [];

  @property({ attribute: false })
  commentTypes: CommentType[] = [];

  @property({ attribute: false })
  onAddComment?: (parentCommentId: string | null) => void;

  private getRootComments(): Comment[] {
    return this.comments.filter((c) => c.parentCommentId === null);
  }

  private getChildComments(parentCommentId: string): Comment[] {
    return this.comments.filter((c) => c.parentCommentId === parentCommentId);
  }

  private getChildCommentsByType(
    parentCommentId: string
  ): Map<string, Comment[]> {
    const childComments = this.getChildComments(parentCommentId);
    const groupedComments = new Map<string, Comment[]>();

    for (const comment of childComments) {
      const typeId = comment.commentTypeId;
      if (!groupedComments.has(typeId)) {
        groupedComments.set(typeId, []);
      }
      groupedComments.get(typeId)!.push(comment);
    }

    return groupedComments;
  }

  private getCommentType(commentTypeId: string): CommentType | undefined {
    return this.commentTypes.find((ct) => ct.id === commentTypeId);
  }

  private renderComment(comment: Comment): unknown {
    const childCommentsByType = this.getChildCommentsByType(comment.id);
    const commentType = this.getCommentType(comment.commentTypeId);

    return html`
      <li class="comment-item">
        <div class="comment-header">
          <span
            class="comment-type-badge"
            style="background-color: ${commentType?.color ?? "#ccc"}"
          >
            ${commentType?.name ?? ""}
          </span>
        </div>
        <div class="comment-content">
          <p>${comment.content}</p>
        </div>
        <div class="comment-actions">
          <button
            class="btn-reply"
            @click=${() => this.onAddComment?.(comment.id)}
          >
            返信
          </button>
        </div>
        ${childCommentsByType.size > 0
          ? html`
              <div class="child-comments">
                ${Array.from(childCommentsByType.entries()).map(
                  ([typeId, comments]) => {
                    const type = this.getCommentType(typeId);
                    return html`
                      <div class="child-comment-group" data-type-id="${typeId}">
                        <div
                          class="child-comment-group-header"
                          style="border-left-color: ${type?.color ?? "#ccc"}"
                        >
                          <span class="child-comment-type-name">
                            ${type?.name ?? ""}
                          </span>
                          <span class="child-comment-count">
                            ${comments.length}
                          </span>
                        </div>
                        <ul class="child-comment-list">
                          ${comments.map((c) => this.renderComment(c))}
                        </ul>
                      </div>
                    `;
                  }
                )}
              </div>
            `
          : ""}
      </li>
    `;
  }

  render() {
    const rootComments = this.getRootComments();

    return html`
      <main class="container container--wide">
        <h1>${this.discussion?.theme ?? ""}</h1>
        <section class="discussion-info">
          <div class="info-section">
            <h2>背景</h2>
            <p>${this.discussion?.background ?? ""}</p>
          </div>
          <div class="info-section">
            <h2>結論</h2>
            <p>${this.discussion?.conclusion ?? ""}</p>
          </div>
        </section>
        <section class="comments-section">
          <div class="comments-header">
            <h2>コメント</h2>
            <button
              class="btn-primary"
              @click=${() => this.onAddComment?.(null)}
            >
              コメントを追加
            </button>
          </div>
          ${rootComments.length === 0
            ? html`
                <p class="empty-message">コメントがありません</p>
              `
            : html`
                <ul class="comment-list">
                  ${rootComments.map((comment) => this.renderComment(comment))}
                </ul>
              `}
        </section>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    sectionStyle,
    listItemStyle,
    css`
      .discussion-info {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;
        padding: 16px;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-default);
      }

      .info-section h2 {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-muted);
        margin-bottom: 8px;
      }

      .info-section p {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.6;
      }

      .comments-section {
        margin-top: 24px;
      }

      .comments-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .comment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .comment-item {
        padding: 16px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .comment-type-badge {
        display: inline-block;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
        border-radius: 4px;
      }

      .comment-content {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.6;
      }

      .comment-actions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }

      .btn-reply {
        padding: 4px 12px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-fg-muted);
        background-color: transparent;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-reply:hover {
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
        background-color: var(--color-canvas-subtle);
      }

      .child-comments {
        margin-top: 16px;
        padding-left: 16px;
      }

      .child-comment-group {
        margin-bottom: 12px;
      }

      .child-comment-group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background-color: var(--color-canvas-subtle);
        border-left: 3px solid;
        border-radius: 0 4px 4px 0;
        margin-bottom: 8px;
      }

      .child-comment-type-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      .child-comment-count {
        font-size: 12px;
        color: var(--color-fg-muted);
        background-color: var(--color-canvas-default);
        padding: 2px 6px;
        border-radius: 10px;
        border: 1px solid var(--color-border-default);
      }

      .child-comment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .child-comment-list .comment-item {
        padding: 12px;
        background-color: var(--color-canvas-subtle);
      }

      .empty-message {
        padding: 16px;
        text-align: center;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-default);
      }
    `,
  ];
}
