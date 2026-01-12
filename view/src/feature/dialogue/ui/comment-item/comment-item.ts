import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TouchController } from "../../../../app/controller/touch";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  DialogueCommentCreateEvent,
  DialogueCommentSelectEvent,
} from "../../event/comment";
import type { Comment } from "../../model/comment";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-card/comment-card";

@customElement("dialogue-comment-item")
export class DialogueCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Object })
  frame?: CommentFrame;

  @state()
  private mode: "view" | "reply" = "view";

  @state()
  private selectedType = "";

  @state()
  private replyContent = "";

  private touch = new TouchController(this);

  private handleCommentClick() {
    if (this.comment && !this.touch.isTouchDevice) {
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  private handleFocusClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  private handleReplyClick(e: Event) {
    e.stopPropagation();
    this.mode = "reply";
    this.selectedType = this.frame?.types[0] || "";
  }

  private handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.selectedType = target.value;
  }

  private handleContentInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.replyContent = target.value;
  }

  private handleReplySave() {
    if (this.comment && this.selectedType && this.replyContent) {
      this.dispatchEvent(
        new DialogueCommentCreateEvent(
          this.comment.id,
          this.selectedType,
          this.replyContent
        )
      );
      this.resetReplyForm();
    }
  }

  private handleReplyCancel() {
    this.resetReplyForm();
  }

  private resetReplyForm() {
    this.mode = "view";
    this.selectedType = "";
    this.replyContent = "";
  }

  render() {
    if (!this.comment) return html``;

    return html`
      <div class="hover-container">${this.renderCommentContent()}</div>
      ${this.mode === "reply" ? this.renderReplyForm() : nothing}
    `;
  }

  private renderCommentContent() {
    return html`
      <dialogue-comment-card
        .comment=${this.comment}
        .activeChildrenCount=${this.activeChildrenCount}
        @click=${this.handleCommentClick}
        style="cursor: pointer;"
      ></dialogue-comment-card>
      <div class="actions" role="group" aria-label="Actions">
        <button
          class="btn-hover reply-button material-symbols-outlined"
          @click=${this.handleReplyClick}
          aria-label="reply"
        >
          reply
        </button>
        ${this.touch.isTouchDevice
          ? html`
              <button
                class="btn-hover focus-button material-symbols-outlined"
                @click=${this.handleFocusClick}
                aria-label="focus"
              >
                ads_click
              </button>
            `
          : nothing}
      </div>
    `;
  }

  private renderReplyForm() {
    return html`
      <div class="reply-form">
        <select .value=${this.selectedType} @change=${this.handleTypeChange}>
          ${this.frame?.types.map(
            (type) =>
              html`
                <option value=${type}>${type}</option>
              `
          )}
        </select>
        <textarea
          placeholder="Enter your reply..."
          .value=${this.replyContent}
          @input=${this.handleContentInput}
        ></textarea>
        <div class="form-actions">
          <button
            class="btn-save material-symbols-outlined"
            @click=${this.handleReplySave}
            title="Save"
          >
            check
          </button>
          <button
            class="btn-cancel material-symbols-outlined"
            @click=${this.handleReplyCancel}
            title="Cancel"
          >
            close
          </button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    hoverButtonStyle,
    css`
      :host {
        display: block;
      }
      .hover-container {
        position: relative;
      }
      .actions {
        display: flex;
        gap: 8px;
        position: absolute;
        bottom: -16px;
        left: 8px;
      }
      .actions .btn-hover {
        position: static;
        opacity: 0;
      }
      .hover-container:hover .btn-hover {
        opacity: 1;
      }
      .reply-form {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply-form select {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        font-size: 14px;
      }
      .reply-form textarea {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        min-height: 80px;
        resize: vertical;
        font-size: 14px;
      }
      .form-actions {
        display: flex;
        gap: 8px;
      }
      .form-actions button {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        cursor: pointer;
      }
      .form-actions button:hover {
        background-color: var(--color-canvas-subtle);
      }
    `,
  ];
}
