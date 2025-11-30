import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type {
  Comment,
  CommentStatus,
  CommentType,
  Discussion,
  Issue,
  Note,
} from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  listItemStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
  sectionStyle,
} from "../../../../style/page";

const STATUS_LABELS: Record<CommentStatus, string> = {
  unassigned: "割り当て待ち",
  assigned: "割り当て済み",
  archived: "アーカイブ",
  deleted: "削除",
};

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

  @property({ attribute: false })
  onFocusComment?: (commentId: string) => void;

  @property({ attribute: false })
  onClearFocus?: () => void;

  @property({ attribute: false })
  onChangeStatus?: (commentId: string) => void;

  @property({ attribute: false })
  onAddIssue?: (commentId: string) => void;

  @property({ attribute: false })
  onShowIssues?: (commentId: string) => void;

  @property({ attribute: false })
  focusedCommentId?: string | null;

  @property({ attribute: false })
  notes: Note[] = [];

  @property({ attribute: false })
  onCreateNote?: (content: string) => void;

  @property({ attribute: false })
  onDeleteNote?: (noteId: string) => void;

  @property({ attribute: false })
  onConvertNoteToComment?: (note: Note) => void;

  @property({ attribute: false })
  issues: Issue[] = [];

  @property({ attribute: false })
  rule?: Rule;

  private getRootComments(): Comment[] {
    return this.comments.filter((c) => c.parentCommentId === "");
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

  private getComment(commentId: string): Comment | undefined {
    return this.comments.find((c) => c.id === commentId);
  }

  private getIssueCount(commentId: string): number {
    return this.issues.filter((i) => i.commentId === commentId).length;
  }

  private getAncestorComments(commentId: string): Comment[] {
    const ancestors: Comment[] = [];
    let current = this.getComment(commentId);
    while (current?.parentCommentId) {
      const parent = this.getComment(current.parentCommentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }

  private getCommentDepth(commentId: string): number {
    let depth = 0;
    let current = this.getComment(commentId);
    while (current?.parentCommentId) {
      depth++;
      current = this.getComment(current.parentCommentId);
    }
    return depth;
  }

  private renderComment(comment: Comment): unknown {
    const childCommentsByType = this.getChildCommentsByType(comment.id);
    const commentType = this.getCommentType(comment.commentTypeId);
    const depth = this.getCommentDepth(comment.id);
    const issueCount = this.getIssueCount(comment.id);

    return html`
      <li class="comment-item" data-depth="${depth}">
        <div class="comment-header">
          <span
            class="comment-type-badge"
            style="background-color: ${commentType?.color ?? "#ccc"}"
          >
            ${commentType?.name ?? ""}
          </span>
          <span class="comment-status-badge" data-status="${comment.status}">
            ${STATUS_LABELS[comment.status]}
          </span>
          ${issueCount > 0
            ? html`
                <span
                  class="issue-count-badge"
                  @click=${() => this.onShowIssues?.(comment.id)}
                >
                  ${issueCount}
                </span>
              `
            : ""}
        </div>
        <div class="comment-content">
          <p>${comment.content}</p>
        </div>
        <div class="comment-actions">
          <button
            class="btn-focus"
            @click=${() => this.onFocusComment?.(comment.id)}
          >
            フォーカス
          </button>
          <button
            class="btn-reply"
            @click=${() => this.onAddComment?.(comment.id)}
          >
            返信
          </button>
          <button
            class="btn-status"
            @click=${() => this.onChangeStatus?.(comment.id)}
          >
            ステータス変更
          </button>
          <button
            class="btn-issue"
            @click=${() => this.onAddIssue?.(comment.id)}
          >
            指摘
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

  private renderAncestorComment(comment: Comment): unknown {
    const commentType = this.getCommentType(comment.commentTypeId);

    return html`
      <li class="ancestor-comment-item">
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
            class="btn-focus"
            @click=${() => this.onFocusComment?.(comment.id)}
          >
            フォーカス
          </button>
        </div>
      </li>
    `;
  }

  render() {
    const focusedComment = this.focusedCommentId
      ? this.getComment(this.focusedCommentId)
      : null;
    const ancestorComments = this.focusedCommentId
      ? this.getAncestorComments(this.focusedCommentId)
      : [];
    const rootComments = this.getRootComments();

    return html`
      <div class="page-layout">
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
          ${this.rule
            ? html`
                <details class="rule-details">
                  <summary>ルール: ${this.rule.name}</summary>
                  <div class="rule-content">
                    <p class="rule-description">${this.rule.description}</p>
                    <div class="rule-comment-types">
                      <h3>コメント種類</h3>
                      <ul class="rule-comment-type-list">
                        ${this.rule.commentTypes.map(
                          (type) => html`
                            <li class="rule-comment-type-item">
                              <span
                                class="color-badge"
                                style="background-color: ${type.color}"
                              ></span>
                              <span class="rule-comment-type-name">
                                ${type.name}
                              </span>
                            </li>
                          `
                        )}
                      </ul>
                    </div>
                    <div class="rule-paths">
                      <h3>経路</h3>
                      <ul class="rule-path-list">
                        ${this.rule.commentTypePaths.map((path) => {
                          const fromType = this.rule?.commentTypes.find(
                            (t) => t.id === path.fromCommentTypeId
                          );
                          const toType = this.rule?.commentTypes.find(
                            (t) => t.id === path.toCommentTypeId
                          );
                          return html`
                            <li class="rule-path-item">
                              <span
                                class="color-badge"
                                style="background-color: ${toType?.color ??
                                "#ccc"}"
                              ></span>
                              <span class="rule-path-type-name">
                                ${toType?.name ?? ""}
                              </span>
                              <span class="rule-path-arrow">←</span>
                              <span
                                class="color-badge"
                                style="background-color: ${fromType?.color ??
                                "#ccc"}"
                              ></span>
                              <span class="rule-path-type-name">
                                ${fromType?.name ?? ""}
                              </span>
                            </li>
                          `;
                        })}
                      </ul>
                    </div>
                  </div>
                </details>
              `
            : ""}
          ${focusedComment
            ? html`
                <section class="focus-header">
                  <button
                    class="btn-unfocus"
                    @click=${() => this.onClearFocus?.()}
                  >
                    フォーカス解除
                  </button>
                </section>
                <section class="ancestor-comments">
                  <ul class="ancestor-comment-list">
                    ${ancestorComments.map((comment) =>
                      this.renderAncestorComment(comment)
                    )}
                  </ul>
                </section>
                <section class="focused-comment-section">
                  <ul class="comment-list">
                    ${this.renderComment(focusedComment)}
                  </ul>
                </section>
              `
            : html`
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
                          ${rootComments.map((comment) =>
                            this.renderComment(comment)
                          )}
                        </ul>
                      `}
                </section>
              `}
        </main>
        <notes-panel-presenter
          .notes=${this.notes}
          .onCreateNote=${this.onCreateNote}
          .onDeleteNote=${this.onDeleteNote}
          .onConvertToComment=${this.onConvertNoteToComment}
        ></notes-panel-presenter>
      </div>
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
      .page-layout {
        display: grid;
        grid-template-columns: 1fr 320px;
        min-height: 100vh;
      }

      main {
        width: 100%;
      }

      notes-panel-presenter {
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
      }

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

      .btn-focus {
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

      .btn-focus:hover {
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
        background-color: var(--color-canvas-subtle);
      }

      .btn-status {
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

      .btn-status:hover {
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
        background-color: var(--color-canvas-subtle);
      }

      .btn-issue {
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

      .btn-issue:hover {
        color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
        background-color: var(--color-danger-subtle);
      }

      .comment-status-badge {
        display: inline-block;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 500;
        border-radius: 10px;
        border: 1px solid;
      }

      .comment-status-badge[data-status="unassigned"] {
        color: var(--color-fg-muted);
        background-color: var(--color-canvas-subtle);
        border-color: var(--color-border-default);
      }

      .comment-status-badge[data-status="assigned"] {
        color: var(--color-success-fg);
        background-color: var(--color-success-subtle);
        border-color: var(--color-success-muted);
      }

      .comment-status-badge[data-status="archived"] {
        color: var(--color-attention-fg);
        background-color: var(--color-attention-subtle);
        border-color: var(--color-attention-muted);
      }

      .comment-status-badge[data-status="deleted"] {
        color: var(--color-danger-fg);
        background-color: var(--color-danger-subtle);
        border-color: var(--color-danger-muted);
      }

      .child-comments {
        margin-top: 16px;
        padding-left: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
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
      }

      /* 深さに応じた背景色（最大10階層） */
      .comment-item[data-depth="0"] {
        background-color: var(--color-canvas-default);
      }
      .comment-item[data-depth="1"] {
        background-color: rgba(0, 0, 0, 0.02);
      }
      .comment-item[data-depth="2"] {
        background-color: rgba(0, 0, 0, 0.04);
      }
      .comment-item[data-depth="3"] {
        background-color: rgba(0, 0, 0, 0.06);
      }
      .comment-item[data-depth="4"] {
        background-color: rgba(0, 0, 0, 0.08);
      }
      .comment-item[data-depth="5"] {
        background-color: rgba(0, 0, 0, 0.1);
      }
      .comment-item[data-depth="6"] {
        background-color: rgba(0, 0, 0, 0.12);
      }
      .comment-item[data-depth="7"] {
        background-color: rgba(0, 0, 0, 0.14);
      }
      .comment-item[data-depth="8"] {
        background-color: rgba(0, 0, 0, 0.16);
      }
      .comment-item[data-depth="9"] {
        background-color: rgba(0, 0, 0, 0.18);
      }
      .comment-item[data-depth="10"] {
        background-color: rgba(0, 0, 0, 0.2);
      }

      .empty-message {
        padding: 16px;
        text-align: center;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-default);
      }

      .focus-header {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 16px;
      }

      .btn-unfocus {
        padding: 6px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-fg-muted);
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-unfocus:hover {
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
        background-color: var(--color-canvas-default);
      }

      .ancestor-comments {
        margin-bottom: 16px;
      }

      .ancestor-comment-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .ancestor-comment-item {
        padding: 12px 16px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        border-left: 3px solid var(--color-border-muted);
      }

      .ancestor-comment-item .comment-content {
        font-size: 13px;
        color: var(--color-fg-muted);
      }

      .focused-comment-section {
        padding-top: 16px;
        border-top: 2px solid var(--color-accent-emphasis);
      }

      .issue-count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        font-size: 11px;
        font-weight: 600;
        color: #ffffff;
        background-color: var(--color-danger-emphasis, #cf222e);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .issue-count-badge:hover {
        background-color: var(--color-danger-fg, #a40e26);
      }

      .rule-details {
        margin-bottom: 24px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .rule-details summary {
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
        cursor: pointer;
        user-select: none;
      }

      .rule-details summary:hover {
        background-color: var(--color-canvas-default);
      }

      .rule-details[open] summary {
        border-bottom: 1px solid var(--color-border-default);
      }

      .rule-content {
        padding: 16px;
      }

      .rule-description {
        font-size: 14px;
        color: var(--color-fg-muted);
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .rule-comment-types,
      .rule-paths {
        margin-bottom: 16px;
      }

      .rule-comment-types:last-child,
      .rule-paths:last-child {
        margin-bottom: 0;
      }

      .rule-comment-types h3,
      .rule-paths h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-fg-muted);
        margin-bottom: 8px;
      }

      .rule-comment-type-list,
      .rule-path-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .rule-comment-type-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        font-size: 13px;
      }

      .color-badge {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 3px;
      }

      .rule-comment-type-name {
        color: var(--color-fg-default);
      }

      .rule-path-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        font-size: 13px;
        color: var(--color-fg-default);
      }

      .rule-path-type-name {
        color: var(--color-fg-default);
      }

      .rule-path-arrow {
        color: var(--color-fg-muted);
        margin: 0 2px;
      }
    `,
  ];
}
