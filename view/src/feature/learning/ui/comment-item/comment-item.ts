import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-edit-form/comment-edit-form";

@customElement("learning-comment-item")
export class LearningCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  @property({ attribute: false })
  onCommentUpdate?: (
    commentId: string,
    detail: { commentType: string; content: string }
  ) => void;

  @property({ attribute: false })
  onCommentDelete?: (commentId: string) => void;

  @state()
  private isEditing = false;

  render() {
    if (!this.comment) return html``;

    if (this.isEditing) {
      return html`
        <learning-comment-edit-form
          .initialType=${this.comment.commentType}
          .initialContent=${this.comment.content}
          .availableTypes=${this.availableTypes}
          .onCancel=${() => (this.isEditing = false)}
          .onSave=${(detail: { commentType: string; content: string }) => {
            if (this.onCommentUpdate) {
              this.onCommentUpdate(this.comment!.id, detail);
            }
            this.isEditing = false;
          }}
        ></learning-comment-edit-form>
      `;
    }

    return html`
      <div class="card-container">
        <learning-comment-card
          .comment=${this.comment}
          @click=${this.handleCommentClick}
          style="cursor: pointer;"
        ></learning-comment-card>
        <button
          class="edit-button material-symbols-outlined"
          @click=${this.handleEditClick}
          aria-label="edit"
        >
          edit
        </button>
        <button
          class="delete-button material-symbols-outlined"
          @click=${this.handleDeleteClick}
          aria-label="delete"
        >
          delete
        </button>
      </div>
    `;
  }

  private handleCommentClick() {
    if (this.onCommentClick && this.comment) {
      this.onCommentClick(this.comment);
    }
  }

  private handleEditClick(e: Event) {
    e.stopPropagation();
    this.isEditing = true;
  }

  private handleDeleteClick(e: Event) {
    e.stopPropagation();
    if (this.onCommentDelete && this.comment) {
      this.onCommentDelete(this.comment.id);
    }
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .card-container {
        position: relative;
      }
      .edit-button,
      .delete-button {
        position: absolute;
        bottom: -16px;
        background: var(--color-canvas-default);
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        z-index: 1;
      }
      .edit-button {
        left: 8px;
      }
      .delete-button {
        left: 48px;
      }
      .card-container:hover .edit-button,
      .card-container:hover .delete-button {
        opacity: 1;
      }
      .edit-button:hover,
      .delete-button:hover {
        background: var(--color-canvas-subtle);
        color: var(--color-accent-fg);
        border-color: var(--color-accent-fg);
      }
      .delete-button:hover {
        color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
      }
    `,
  ];
}
