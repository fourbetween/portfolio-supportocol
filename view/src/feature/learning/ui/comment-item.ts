import { LitElement, css, html, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { actionStyle } from "../../../shared/style/action";
import { baseStyle } from "../../../shared/style/base";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import "../../../shared/ui/icons/icon-ads-click";
import "../../../shared/ui/icons/icon-archive";
import "../../../shared/ui/icons/icon-check";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-content-cut";
import "../../../shared/ui/icons/icon-content-paste";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-edit";
import "../../../shared/ui/icons/icon-psychology";
import "../../../shared/ui/icons/icon-reply";
import "../../../shared/ui/icons/icon-unarchive";
import {
  LearningCommentArchiveEvent,
  LearningCommentCutEvent,
  LearningCommentDeleteEvent,
  LearningCommentGenerateEvent,
  LearningCommentMoveEvent,
  LearningCommentSelectEvent,
  LearningCommentTypeSelectEvent,
  LearningCommentUnarchiveEvent,
  LearningProposedCommentAcceptEvent,
  LearningProposedCommentRejectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import "./comment-card";
import "./comment-edit-form";
import "./comment-type-popup";
import type { LearningCommentTypePopup } from "./comment-type-popup";

@customElement("learning-comment-item")
export class LearningCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  archived = false;

  @property({ type: String })
  cutCommentId?: string;

  @property({ type: Array })
  invalidPasteTargetIds: string[] = [];

  @state()
  private mode: "view" | "edit" | "reply" | "generate" = "view";

  @state()
  private selectedReplyType?: string;

  @query("learning-comment-type-popup")
  private typePopup!: LearningCommentTypePopup;

  private handleCommentSelect(e: LearningCommentSelectEvent) {
    e.stopPropagation();
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

  private handleArchiveClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentArchiveEvent(this.comment.id));
    }
  }

  private handleUnarchiveClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentUnarchiveEvent(this.comment.id));
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

  private handleCutClick(e: Event) {
    e.stopPropagation();
    const nextCutCommentId =
      this.cutCommentId === this.comment?.id ? undefined : this.comment?.id;
    this.dispatchEvent(new LearningCommentCutEvent(nextCutCommentId));
  }

  private handlePasteClick(e: Event) {
    e.stopPropagation();
    if (this.cutCommentId && this.comment) {
      this.dispatchEvent(
        new LearningCommentMoveEvent(this.cutCommentId, this.comment.id),
      );
    }
  }

  private handleTypeSelected(e: LearningCommentTypeSelectEvent) {
    const commentType = e.commentType;
    if (this.mode === "reply") {
      this.selectedReplyType = commentType;
    } else if (this.mode === "generate") {
      if (this.comment) {
        this.dispatchEvent(
          new LearningCommentGenerateEvent(this.comment.id, commentType),
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
      <div class="hover-container">
        <slot name="type-badge"></slot>
        ${this.renderCommentContent()}
      </div>
      ${this.renderReplyFormOrPopup()}
    `;
  }

  private renderCommentContent() {
    return html`
      <learning-comment-card
        .comment=${this.comment}
        .activeChildrenCount=${this.activeChildrenCount}
        .archived=${this.archived}
        .clickable=${false}
        @learning-comment-select=${this.handleCommentSelect}
      ></learning-comment-card>
      <div class="actions" role="group" aria-label="Actions">
        ${this.renderActions()}
      </div>
    `;
  }

  private renderActions() {
    const focusButton = this.renderIconButton(
      html`
        <ui-icon-ads-click></ui-icon-ads-click>
      `,
      "focus",
      (e) => this.handleFocusClick(e),
    );

    if (this.readonly) {
      return focusButton;
    }

    const isProposed = this.comment?.status === "proposed";
    const isExplicitlyArchived = !!this.comment?.archivedAt;

    if (isProposed) {
      return html`
        ${this.renderIconButton(
          html`
            <ui-icon-close></ui-icon-close>
          `,
          "reject",
          this.handleRejectClick,
          "danger reject-button",
        )}
        ${this.renderIconButton(
          html`
            <ui-icon-check></ui-icon-check>
          `,
          "accept",
          this.handleAcceptClick,
          "success accept-button",
        )}
        ${focusButton}
      `;
    }

    const moveButton = this.renderMoveButton();

    const archiveUnarchiveButton = isExplicitlyArchived
      ? this.renderIconButton(
          html`
            <ui-icon-unarchive></ui-icon-unarchive>
          `,
          "unarchive",
          this.handleUnarchiveClick,
          "unarchive-button",
        )
      : this.renderIconButton(
          html`
            <ui-icon-archive></ui-icon-archive>
          `,
          "archive",
          this.handleArchiveClick,
          "archive-button",
        );

    return html`
      ${this.renderIconButton(
        html`
          <ui-icon-delete></ui-icon-delete>
        `,
        "delete",
        this.handleDeleteClick,
        "danger delete-button",
      )}
      ${this.renderIconButton(
        html`
          <ui-icon-psychology></ui-icon-psychology>
        `,
        "generate",
        (e) => this.handleOpenTypePopup(e, "generate"),
        "primary generate-button",
      )}
      ${moveButton} ${archiveUnarchiveButton}
      ${this.renderIconButton(
        html`
          <ui-icon-edit></ui-icon-edit>
        `,
        "edit",
        this.handleEditClick,
        "edit-button",
      )}
      ${this.renderIconButton(
        html`
          <ui-icon-reply></ui-icon-reply>
        `,
        "reply",
        (e) => this.handleOpenTypePopup(e, "reply"),
      )}
      ${focusButton}
    `;
  }

  private renderMoveButton() {
    if (!this.comment) {
      return html``;
    }

    if (!this.cutCommentId) {
      return this.renderIconButton(
        html`
          <ui-icon-content-cut></ui-icon-content-cut>
        `,
        "cut",
        this.handleCutClick,
        "cut-button",
      );
    }

    if (this.cutCommentId === this.comment.id) {
      return this.renderIconButton(
        html`
          <ui-icon-content-cut></ui-icon-content-cut>
        `,
        "cancel-cut",
        this.handleCutClick,
        "primary cut-button is-active",
      );
    }

    if (this.invalidPasteTargetIds.includes(this.comment.id)) {
      return html``;
    }

    return this.renderIconButton(
      html`
        <ui-icon-content-paste></ui-icon-content-paste>
      `,
      "paste",
      this.handlePasteClick,
      "primary paste-button",
    );
  }

  private renderIconButton(
    icon: TemplateResult,
    label: string,
    handler: (e: Event) => void,
    extraClass = "",
  ) {
    const className = extraClass.includes("-button")
      ? extraClass
      : `${label}-button ${extraClass}`;
    return html`
      <button
        class="btn-hover ${className}"
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
        .initialType=${this.comment!.type}
        .initialContent=${this.comment!.content}
        .availableTypes=${this.availableTypes}
        @learning-comment-form-close=${() => (this.mode = "view")}
        @learning-comment-update=${this.handleFormSave}
      ></learning-comment-edit-form>
    `;
  }

  static styles = [
    baseStyle,
    hoverButtonStyle,
    actionStyle,
    css`
      :host {
        display: block;
        position: relative;
      }
      .reply-form {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
      .btn-hover.is-active {
        opacity: 1;
        color: var(--color-btn-primary-bg);
        border-color: var(--color-btn-primary-bg);
      }
    `,
  ];
}
