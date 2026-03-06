import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { commentItemStyle } from "../../../shared/style/comment-item";
import "../../../shared/ui/icons/icon-ads-click";
import "../../../shared/ui/icons/icon-archive";
import "../../../shared/ui/icons/icon-check";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-content-cut";
import "../../../shared/ui/icons/icon-content-paste";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-edit";
import "../../../shared/ui/icons/icon-more-horiz";
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
  private menuOpen = false;

  @state()
  private selectedReplyType?: string;

  @query("learning-comment-type-popup")
  private typePopup!: LearningCommentTypePopup;

  private handleCommentSelect(e: LearningCommentSelectEvent) {
    e.stopPropagation();
  }

  private closeMenu() {
    this.menuOpen = false;
  }

  private toggleMenu(e: Event) {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  private handleFocusClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentSelectEvent(this.comment.id));
    }
  }

  private handleEditClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    this.mode = "edit";
  }

  private async handleOpenTypePopup(e: Event, mode: "reply" | "generate") {
    e.stopPropagation();
    this.closeMenu();
    this.mode = mode;
    await this.updateComplete;
    this.typePopup?.open();
  }

  private handleDeleteClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentDeleteEvent(this.comment.id));
    }
  }

  private handleArchiveClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    if (this.comment) {
      this.dispatchEvent(new LearningCommentArchiveEvent(this.comment.id));
    }
  }

  private handleUnarchiveClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
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
    this.closeMenu();
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
      <div class="card-wrapper">
        <slot name="type-badge"></slot>
        ${this.renderCommentContent()} ${this.renderToolbar()}
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
    `;
  }

  private renderToolbar() {
    const isProposed = this.comment?.status === "proposed";

    if (isProposed) {
      return html`
        <div class="toolbar" role="group" aria-label="Actions">
          <button
            class="toolbar-btn success"
            @click=${this.handleAcceptClick}
            aria-label="accept"
          >
            <ui-icon-check></ui-icon-check>
          </button>
          <button
            class="toolbar-btn danger"
            @click=${this.handleRejectClick}
            aria-label="reject"
          >
            <ui-icon-close></ui-icon-close>
          </button>
          ${this.renderMoreButton([
            this.menuItem(
              html`
                <ui-icon-ads-click></ui-icon-ads-click>
              `,
              "Focus",
              (e) => this.handleFocusClick(e),
            ),
          ])}
        </div>
      `;
    }

    if (this.readonly) {
      return html`
        <div class="toolbar" role="group" aria-label="Actions">
          <button
            class="toolbar-btn"
            @click=${(e: Event) => this.handleFocusClick(e)}
            aria-label="focus"
          >
            <ui-icon-ads-click></ui-icon-ads-click>
          </button>
        </div>
      `;
    }

    const showPaste =
      this.cutCommentId &&
      this.cutCommentId !== this.comment?.id &&
      this.comment &&
      !this.invalidPasteTargetIds.includes(this.comment.id);

    return html`
      <div
        class="toolbar ${this.menuOpen ? "is-open" : ""}"
        role="group"
        aria-label="Actions"
      >
        ${showPaste
          ? html`
              <button
                class="toolbar-btn primary"
                @click=${this.handlePasteClick}
                aria-label="paste"
              >
                <ui-icon-content-paste></ui-icon-content-paste>
              </button>
            `
          : nothing}
        <button
          class="toolbar-btn"
          @click=${(e: Event) => this.handleOpenTypePopup(e, "reply")}
          aria-label="reply"
        >
          <ui-icon-reply></ui-icon-reply>
        </button>
        ${this.renderMoreButton(this.buildMenuItems())}
      </div>
    `;
  }

  private buildMenuItems(): TemplateResult[] {
    const items: TemplateResult[] = [];
    const isExplicitlyArchived = !!this.comment?.archivedAt;
    const isCutSource = this.cutCommentId === this.comment?.id;

    items.push(
      this.menuItem(
        html`
          <ui-icon-ads-click></ui-icon-ads-click>
        `,
        "Focus",
        (e) => this.handleFocusClick(e),
      ),
    );

    items.push(
      this.menuItem(
        html`
          <ui-icon-edit></ui-icon-edit>
        `,
        "Edit",
        (e) => this.handleEditClick(e),
      ),
    );

    items.push(
      this.menuItem(
        html`
          <ui-icon-psychology></ui-icon-psychology>
        `,
        "Generate",
        (e) => this.handleOpenTypePopup(e, "generate"),
      ),
    );

    if (isCutSource) {
      items.push(
        this.menuItem(
          html`
            <ui-icon-content-cut></ui-icon-content-cut>
          `,
          "Cancel cut",
          (e) => this.handleCutClick(e),
          "primary",
        ),
      );
    } else if (!this.cutCommentId) {
      items.push(
        this.menuItem(
          html`
            <ui-icon-content-cut></ui-icon-content-cut>
          `,
          "Cut",
          (e) => this.handleCutClick(e),
        ),
      );
    }

    if (isExplicitlyArchived) {
      items.push(
        this.menuItem(
          html`
            <ui-icon-unarchive></ui-icon-unarchive>
          `,
          "Unarchive",
          (e) => this.handleUnarchiveClick(e),
        ),
      );
    } else {
      items.push(
        this.menuItem(
          html`
            <ui-icon-archive></ui-icon-archive>
          `,
          "Archive",
          (e) => this.handleArchiveClick(e),
        ),
      );
    }

    items.push(
      this.menuItem(
        html`
          <ui-icon-delete></ui-icon-delete>
        `,
        "Delete",
        (e) => this.handleDeleteClick(e),
        "danger",
      ),
    );

    return items;
  }

  private menuItem(
    icon: TemplateResult,
    label: string,
    handler: (e: Event) => void,
    variant = "",
  ): TemplateResult {
    return html`
      <button class="menu-item ${variant}" @click=${handler}>
        ${icon}
        <span>${label}</span>
      </button>
    `;
  }

  private renderMoreButton(items: TemplateResult[]) {
    return html`
      <div class="more-wrapper">
        <button
          class="toolbar-btn"
          @click=${(e: Event) => this.toggleMenu(e)}
          aria-label="more actions"
          aria-expanded=${this.menuOpen}
        >
          <ui-icon-more-horiz></ui-icon-more-horiz>
        </button>
        ${this.menuOpen
          ? html`
              <div class="menu-backdrop" @click=${() => this.closeMenu()}></div>
              <div class="action-menu" role="menu">${items}</div>
            `
          : nothing}
      </div>
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
    commentItemStyle,
    css`
      .toolbar.is-open {
        opacity: 1;
        z-index: 50;
      }

      .toolbar-btn.primary {
        color: var(--color-btn-primary-bg);
      }
      .toolbar-btn.primary:hover {
        border-color: var(--color-btn-primary-bg);
      }
      .toolbar-btn.success {
        color: var(--color-success-fg);
      }
      .toolbar-btn.success:hover {
        border-color: var(--color-success-fg);
      }

      /* More button wrapper */
      .more-wrapper {
        position: relative;
      }

      /* Backdrop to close menu on outside click */
      .menu-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99;
      }

      /* Dropdown action menu */
      .action-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        z-index: 100;
        background: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        min-width: 160px;
        padding: 4px 0;
        display: flex;
        flex-direction: column;
      }

      /* Menu item */
      .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: none;
        background: none;
        color: var(--color-fg-default);
        font-size: 13px;
        cursor: pointer;
        white-space: nowrap;
        text-align: left;
        transition: background 0.1s;
      }
      .menu-item:hover {
        background: var(--color-canvas-subtle);
      }
      .menu-item.danger {
        color: var(--color-danger-fg);
        border-top: 1px solid var(--color-border-default);
        margin-top: 4px;
        padding-top: 12px;
      }
      .menu-item.primary {
        color: var(--color-btn-primary-bg);
      }

      /* Reply form */
      .reply-form {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
    `,
  ];
}
