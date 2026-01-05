import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  CommentDeletedEvent,
  CommentGeneratedEvent,
  CommentSaveEvent,
  CommentTypeSelectEvent,
  RequestCommentReplyEvent,
  RequestCommentUpdateEvent,
  SelectCommentEvent,
} from "../../event/comment";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-edit-form/comment-edit-form";
import "../comment-type-popup/comment-type-popup";
import type { LearningCommentTypePopup } from "../comment-type-popup/comment-type-popup";

@customElement("learning-comment-item")
export class LearningCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Array })
  availableTypes: string[] = [];

  @state()
  private isEditing = false;

  @state()
  private isReplying = false;

  @state()
  private selectedReplyType?: string;

  @query("learning-comment-type-popup")
  private typePopup!: LearningCommentTypePopup;

  private handleCommentClick() {
    if (this.comment) {
      this.dispatchEvent(new SelectCommentEvent(this.comment.id));
    }
  }

  private handleEditClick(e: Event) {
    e.stopPropagation();
    this.isEditing = true;
  }

  private async handleReplyClick(e: Event) {
    e.stopPropagation();
    this.isReplying = true;
    await this.updateComplete;
    this.typePopup?.open();
  }

  private async handleGenerateClick(e: Event) {
    e.stopPropagation();
    this.isReplying = false;
    await this.updateComplete;
    this.typePopup?.open();
  }

  private handleDeleteClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new CommentDeletedEvent(this.comment.id));
    }
  }

  private handleTypeSelected(e: CommentTypeSelectEvent) {
    const commentType = e.commentType;
    if (this.isReplying) {
      this.selectedReplyType = commentType;
    } else {
      if (this.comment) {
        this.dispatchEvent(
          new CommentGeneratedEvent(this.comment.id, commentType)
        );
      }
    }
  }

  private handleUpdate(e: CommentSaveEvent) {
    if (this.comment) {
      this.dispatchEvent(
        new RequestCommentUpdateEvent(this.comment.id, e.commentType, e.content)
      );
    }
    this.isEditing = false;
  }

  private handleReply(e: CommentSaveEvent) {
    if (this.comment) {
      this.dispatchEvent(
        new RequestCommentReplyEvent(this.comment.id, e.commentType, e.content)
      );
    }
    this.isReplying = false;
    this.selectedReplyType = undefined;
  }

  render() {
    if (!this.comment) return html``;

    if (this.isEditing) {
      return this.renderEditForm();
    }

    return html`
      <div class="hover-container">${this.renderCommentContent()}</div>
      ${this.renderReplyFormOrPopup()}
    `;
  }

  private renderCommentContent() {
    return html`
      <learning-comment-card
        .comment=${this.comment}
        .activeChildrenCount=${this.activeChildrenCount}
        @click=${this.handleCommentClick}
        style="cursor: pointer;"
      ></learning-comment-card>
      <button
        class="btn-hover reply-button material-symbols-outlined"
        @click=${this.handleReplyClick}
        aria-label="reply"
      >
        reply
      </button>
      <button
        class="btn-hover primary generate-button material-symbols-outlined"
        @click=${this.handleGenerateClick}
        aria-label="generate"
      >
        psychology
      </button>
      <button
        class="btn-hover edit-button material-symbols-outlined"
        @click=${this.handleEditClick}
        aria-label="edit"
      >
        edit
      </button>
      <button
        class="btn-hover danger delete-button material-symbols-outlined"
        @click=${this.handleDeleteClick}
        aria-label="delete"
      >
        delete
      </button>
    `;
  }

  private renderReplyFormOrPopup() {
    if (this.isReplying && this.selectedReplyType) {
      return html`
        <learning-comment-edit-form
          class="reply-form"
          .initialType=${this.selectedReplyType}
          .availableTypes=${this.availableTypes}
          @comment-cancel=${() => (this.isReplying = false)}
          @comment-save=${this.handleReply}
        ></learning-comment-edit-form>
      `;
    }

    return html`
      <learning-comment-type-popup
        .types=${this.availableTypes}
        @comment-type-select=${this.handleTypeSelected}
      ></learning-comment-type-popup>
    `;
  }

  private renderEditForm() {
    return html`
      <learning-comment-edit-form
        .initialType=${this.comment!.commentType}
        .initialContent=${this.comment!.content}
        .availableTypes=${this.availableTypes}
        @comment-cancel=${() => (this.isEditing = false)}
        @comment-save=${this.handleUpdate}
      ></learning-comment-edit-form>
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
      .reply-button {
        bottom: -16px;
        left: 8px;
      }
      .generate-button {
        bottom: -16px;
        left: 48px;
      }
      .edit-button {
        bottom: -16px;
        left: 88px;
      }
      .delete-button {
        bottom: -16px;
        left: 128px;
      }
      .reply-form {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
    `,
  ];
}
