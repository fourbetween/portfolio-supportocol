import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { TouchController } from "../../../../app/controller/touch";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  LearningCommentDeleteEvent,
  LearningCommentGenerateEvent,
  LearningCommentSelectEvent,
  LearningCommentTypeSelectEvent,
  LearningProposedCommentAcceptEvent,
  LearningProposedCommentRejectEvent,
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

  private touch = new TouchController(this);

  private handleCommentSelect(e: LearningCommentSelectEvent) {
    e.stopPropagation();
    if (this.comment && !this.touch.isTouchDevice) {
      this.dispatchEvent(new LearningCommentSelectEvent(this.comment.id));
    }
  }

  private handleFocusClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentSelectEvent(this.comment.id));
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
      this.dispatchEvent(new LearningCommentDeleteEvent(this.comment.id));
    }
  }

  private handleAcceptClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new LearningProposedCommentAcceptEvent(this.comment));
    }
  }

  private handleRejectClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new LearningProposedCommentRejectEvent(this.comment));
    }
  }

  private handleTypeSelected(e: LearningCommentTypeSelectEvent) {
    const commentType = e.commentType;
    if (this.mode === "reply") {
      this.selectedReplyType = commentType;
    } else if (this.mode === "generate") {
      if (this.comment) {
        this.dispatchEvent(
          new LearningCommentGenerateEvent(this.comment.id, commentType)
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
    const isProposed = this.comment?.status === "proposed";

    return html`
      <learning-comment-card
        .comment=${this.comment}
        .activeChildrenCount=${this.activeChildrenCount}
        @learning-comment-select=${this.handleCommentSelect}
        style="cursor: pointer;"
      ></learning-comment-card>
      <div class="actions" role="group" aria-label="Actions">
        ${isProposed
          ? html`
              ${this.renderIconButton(
                "check",
                "accept",
                this.handleAcceptClick,
                "success accept-button"
              )}
              ${this.renderIconButton(
                "close",
                "reject",
                this.handleRejectClick,
                "danger reject-button"
              )}
            `
          : html`
              ${this.renderIconButton("reply", "reply", (e) =>
                this.handleOpenTypePopup(e, "reply")
              )}
              ${this.renderIconButton(
                "edit",
                "edit",
                this.handleEditClick,
                "edit-button"
              )}
              ${this.renderIconButton(
                "psychology",
                "generate",
                (e) => this.handleOpenTypePopup(e, "generate"),
                "primary generate-button"
              )}
              ${this.renderIconButton(
                "delete",
                "delete",
                this.handleDeleteClick,
                "danger delete-button"
              )}
            `}
        ${this.touch.isTouchDevice
          ? this.renderIconButton("ads_click", "focus", (e) =>
              this.handleFocusClick(e)
            )
          : nothing}
      </div>
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
          @learning-comment-form-close=${() => (this.mode = "view")}
          @learning-comment-create=${this.handleFormSave}
        ></learning-comment-edit-form>
      `;
    }

    return html`
      <learning-comment-type-popup
        .types=${this.availableTypes}
        @learning-comment-type-select=${this.handleTypeSelected}
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
        @learning-comment-form-close=${() => (this.mode = "view")}
        @learning-comment-update=${this.handleFormSave}
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
      }
    `,
  ];
}
