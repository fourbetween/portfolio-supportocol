import { msg } from "@lit/localize";
import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { commentItemStyle } from "../../../shared/style/comment-item";
import "../../../shared/ui/icons/icon-ads-click";
import "../../../shared/ui/icons/icon-more-horiz";
import "../../../shared/ui/icons/icon-reply";
import "../../../shared/ui/icons/icon-report-problem";
import {
  DialogueCommentIssueRequestEvent,
  DialogueCommentSelectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import type { DialogueSettings } from "../model/discussion";
import { canPerform } from "../model/permission";
import "./comment-card";
import "./comment-reply-form";

@customElement("dialogue-comment-item")
export class DialogueCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Object })
  settings?: DialogueSettings;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  isAuthenticated = false;

  @property({ type: Boolean })
  archived = false;

  @state()
  private mode: "view" | "reply" = "view";

  @state()
  private menuOpen = false;

  private get canReply() {
    if (this.readonly) return false;
    if (this.archived || this.comment?.archivedAt) return false;
    if (!this.comment || !this.settings) return false;

    if (!canPerform(this.settings.commentPermission, this.isAuthenticated)) {
      return false;
    }

    return this.settings.commentFrame.paths.some(
      (p) => p.parent === this.comment?.type,
    );
  }

  private get canIssue() {
    if (this.readonly) return false;
    if (!this.comment || !this.settings) return false;

    return canPerform(this.settings.issuePermission, this.isAuthenticated);
  }

  private handleCommentSelect(e: DialogueCommentSelectEvent) {
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
      this.dispatchEvent(new DialogueCommentSelectEvent(this.comment.id));
    }
  }

  private handleReplyClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    this.mode = "reply";
  }

  private handleIssueClick(e: Event) {
    e.stopPropagation();
    this.closeMenu();
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentIssueRequestEvent(this.comment.id));
    }
  }

  render() {
    if (!this.comment) return html``;

    return html`
      <div class="card-wrapper">
        ${this.renderCommentContent()} ${this.renderToolbar()}
      </div>
      ${this.mode === "reply"
        ? html`
            <div class="reply-form-wrapper">
              <dialogue-comment-reply-form
                .parentCommentId=${this.comment.id}
                .parentCommentType=${this.comment.type}
                .frame=${this.settings?.commentFrame}
                @dialogue-comment-create=${() => (this.mode = "view")}
                @dialogue-comment-create-cancel=${() => (this.mode = "view")}
              ></dialogue-comment-reply-form>
            </div>
          `
        : nothing}
    `;
  }

  private renderCommentContent() {
    return html`
      <dialogue-comment-card
        .comment=${this.comment}
        .activeChildrenCount=${this.activeChildrenCount}
        .archived=${this.archived || !!this.comment?.archivedAt}
        .clickable=${false}
        @dialogue-comment-select=${this.handleCommentSelect}
      ></dialogue-comment-card>
    `;
  }

  private renderToolbar() {
    return html`
      <div
        class="toolbar ${this.menuOpen ? "is-open" : ""}"
        role="group"
        aria-label="Actions"
      >
        ${this.canReply
          ? html`
              <button
                class="toolbar-btn"
                @click=${this.handleReplyClick}
                aria-label=${msg("reply")}
              >
                <ui-icon-reply></ui-icon-reply>
              </button>
            `
          : nothing}
        ${this.renderMoreButton(this.buildMenuItems())}
      </div>
    `;
  }

  private buildMenuItems(): TemplateResult[] {
    const items = [
      this.menuItem(
        html`
          <ui-icon-ads-click></ui-icon-ads-click>
        `,
        msg("focus"),
        (e) => this.handleFocusClick(e),
      ),
    ];

    if (this.canIssue) {
      items.push(
        this.menuItem(
          html`
            <ui-icon-report-problem></ui-icon-report-problem>
          `,
          msg("report problem"),
          (e) => this.handleIssueClick(e),
          "danger",
        ),
      );
    }

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

  static styles = [
    baseStyle,
    commentItemStyle,
    css`
      .reply-form-wrapper {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
    `,
  ];
}
