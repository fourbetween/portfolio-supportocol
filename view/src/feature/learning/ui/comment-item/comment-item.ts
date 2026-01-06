import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  CommentDeleteEvent,
  CommentGenerateEvent,
  CommentSelectEvent,
  CommentTypeSelectEvent,
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
  private mode: "view" | "edit" | "reply" | "generate" = "view";

  @state()
  private selectedReplyType?: string;

  @query("learning-comment-type-popup")
  private typePopup!: LearningCommentTypePopup;

  private handleCommentClick() {
    if (this.comment) {
      this.dispatchEvent(new CommentSelectEvent(this.comment.id));
    }
  }

  private handleEditClick(e: Event) {
    e.stopPropagation();
    this.mode = "edit";
  }

  private async handleOpenTypePopup(e: Event, mode: "reply" | "generate") {
    e.stopPropagation();
    this.mode = mode;
    await this.updateComplete;
    this.typePopup?.open();
  }

  private handleDeleteClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new CommentDeleteEvent(this.comment.id));
    }
  }

  private handleTypeSelected(e: CommentTypeSelectEvent) {
    const commentType = e.commentType;
    if (this.mode === "reply") {
      this.selectedReplyType = commentType;
    } else if (this.mode === "generate") {
      if (this.comment) {
        this.dispatchEvent(
          new CommentGenerateEvent(this.comment.id, commentType)
        );
      }
      this.mode = "view";
    }
  }

  private handleFormSave() {
    this.mode = "view";
    this.selectedReplyType = undefined;
  }

  render() {
    if (!this.comment) return html``;

    if (this.mode === "edit") {
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
      ${this.renderIconButton("reply", "reply", (e) =>
        this.handleOpenTypePopup(e, "reply")
      )}
      ${this.renderIconButton(
        "psychology",
        "generate",
        (e) => this.handleOpenTypePopup(e, "generate"),
        "primary generate-button"
      )}
      ${this.renderIconButton(
        "edit",
        "edit",
        this.handleEditClick,
        "edit-button"
      )}
      ${this.renderIconButton(
        "delete",
        "delete",
        this.handleDeleteClick,
        "danger delete-button"
      )}
    `;
  }

  private renderIconButton(
    icon: string,
    label: string,
    handler: (e: Event) => void,
    extraClass = ""
  ) {
    const className = extraClass.includes("-button")
      ? extraClass
      : `${label}-button ${extraClass}`;
    return html`
      <button
        class="btn-hover ${className} material-symbols-outlined"
        @click=${handler}
        aria-label=${label}
      >
        ${icon}
      </button>
    `;
  }

  private renderReplyFormOrPopup() {
    if (this.mode === "reply" && this.selectedReplyType) {
      return html`
        <learning-comment-edit-form
          class="reply-form"
          .parentCommentId=${this.comment?.id}
          .initialType=${this.selectedReplyType}
          .availableTypes=${this.availableTypes}
          @comment-form-close=${() => (this.mode = "view")}
          @comment-create=${this.handleFormSave}
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
        .commentId=${this.comment?.id}
        .initialType=${this.comment!.commentType}
        .initialContent=${this.comment!.content}
        .availableTypes=${this.availableTypes}
        @comment-form-close=${() => (this.mode = "view")}
        @comment-update=${this.handleFormSave}
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
