import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import { client } from "../api/client";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import "../ui/comment-context/comment-context";
import "../ui/comment-edit-form/comment-edit-form";
import "../ui/comment-tree/comment-tree";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Array })
  comments: Comment[] = [];

  @state()
  private _focusedCommentId?: string;

  @state()
  private _isCreating = false;

  @state()
  private _replyToId?: string;

  private get _focusedComment() {
    return this.comments.find((c) => c.id === this._focusedCommentId);
  }

  private get _ancestors() {
    if (!this._focusedCommentId) return [];
    return this._getAncestors(this._focusedCommentId);
  }

  private _getAncestors(commentId: string) {
    const ancestors: Comment[] = [];
    let current = this.comments.find((c) => c.id === commentId);
    while (current?.parentCommentId) {
      const parent = this.comments.find(
        (c) => c.id === current?.parentCommentId
      );
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }

  private get _descendants() {
    if (!this._focusedCommentId) return [];

    const descendants: Comment[] = [];
    const queue = [this._focusedCommentId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const children = this.comments.filter((c) => c.parentCommentId === id);
      descendants.push(...children);
      queue.push(...children.map((c) => c.id));
    }
    return descendants;
  }

  private get _replyToAncestors() {
    if (!this._replyToId) return [];
    const parent = this.comments.find((c) => c.id === this._replyToId);
    const ancestors = this._getAncestors(this._replyToId);
    if (parent) ancestors.push(parent);
    return ancestors;
  }

  render() {
    if (this._isCreating) {
      return html`
        <div class="container">
          <div class="section">
            <learning-comment-context
              .ancestors=${this._replyToAncestors}
            ></learning-comment-context>
          </div>
          <div class="section focused">
            <learning-comment-edit-form
              .availableTypes=${["idea", "question", "answer", "proposal"]}
              .onCancel=${this.handleCancel}
              .onSave=${this.handleSave}
            ></learning-comment-edit-form>
          </div>
        </div>
      `;
    }

    if (this._focusedCommentId && this._focusedComment) {
      return html`
        <div class="container">
          <div class="section">
            <learning-comment-context
              .ancestors=${this._ancestors}
            ></learning-comment-context>
          </div>
          <div class="section focused">
            <learning-comment-edit-form
              .initialType=${this._focusedComment.commentType}
              .initialContent=${this._focusedComment.content}
              .availableTypes=${["idea", "question", "answer", "proposal"]}
              .onCancel=${this.handleCancel}
              .onSave=${this.handleSave}
            ></learning-comment-edit-form>
            <div class="focused-actions">
              <button class="btn" @click=${this.handleReply}>Reply</button>
            </div>
          </div>
          <div class="section">
            <learning-comment-tree
              .comments=${this._descendants}
              .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
            ></learning-comment-tree>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <div class="actions">
          <button
            class="btn btn-primary"
            @click=${this.handleNewComment}
            title="New Comment"
          >
            <span class="material-symbols-outlined">add_comment</span>
          </button>
        </div>
        <learning-comment-tree
          .comments=${this.comments}
          .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
        ></learning-comment-tree>
      </div>
    `;
  }

  private handleCommentClick(comment: Comment) {
    this._focusedCommentId = comment.id;
    this._isCreating = false;
    this._replyToId = undefined;
  }

  private handleNewComment() {
    this._isCreating = true;
    this._replyToId = undefined;
    this._focusedCommentId = undefined;
  }

  private handleReply() {
    this._replyToId = this._focusedCommentId;
    this._isCreating = true;
    this._focusedCommentId = undefined;
  }

  private handleCancel = () => {
    this._focusedCommentId = undefined;
    this._isCreating = false;
    this._replyToId = undefined;
  };

  private handleSave = async (detail: {
    commentType: string;
    content: string;
  }) => {
    if (!this.discussion) return;

    if (this._isCreating) {
      const { error } = await client.POST(
        "/learning/discussions/{discussionId}/comments",
        {
          params: {
            path: { discussionId: this.discussion.id },
          },
          body: {
            parentCommentId: this._replyToId || null,
            commentType: detail.commentType,
            content: detail.content,
          },
        }
      );

      if (error) {
        showToast(this, "Failed to create comment.", "error");
        return;
      }
      showToast(this, "Comment created.", "success");
    } else if (this._focusedCommentId) {
      const { error } = await client.PUT(
        "/learning/discussions/{discussionId}/comments/{commentId}",
        {
          params: {
            path: {
              discussionId: this.discussion.id,
              commentId: this._focusedCommentId,
            },
          },
          body: {
            commentType: detail.commentType,
            content: detail.content,
          },
        }
      );

      if (error) {
        showToast(this, "Failed to save comment.", "error");
        return;
      }
      showToast(this, "Comment saved.", "success");
    }

    this.dispatchEvent(
      new CustomEvent("comment-saved", {
        bubbles: true,
        composed: true,
      })
    );

    this._focusedCommentId = undefined;
    this._isCreating = false;
    this._replyToId = undefined;
  };

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .container {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .section {
        width: 100%;
      }
      .focused {
        border: 2px solid var(--color-accent-fg);
        border-radius: 8px;
        padding: 8px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
      }
      .focused-actions {
        margin-top: 8px;
        display: flex;
        justify-content: flex-end;
      }
    `,
  ];
}
