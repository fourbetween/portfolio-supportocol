import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TouchController } from "../../../app/controller/touch";
import { actionStyle } from "../../../shared/style/action";
import { baseStyle } from "../../../shared/style/base";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { iconStyle } from "../../../shared/style/icon";
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

  private touch = new TouchController(this);

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
  }

  private handleIssueClick(e: Event) {
    e.stopPropagation();
    if (this.comment) {
      this.dispatchEvent(new DialogueCommentIssueRequestEvent(this.comment.id));
    }
  }

  render() {
    if (!this.comment) return html``;

    return html`
      <div class="hover-container">${this.renderCommentContent()}</div>
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
        @dialogue-comment-select=${this.handleCommentSelect}
      ></dialogue-comment-card>
      <div class="actions" role="group" aria-label="Actions">
        ${this.canReply
          ? html`
              <button
                class="btn-hover reply-button material-symbols-outlined"
                @click=${this.handleReplyClick}
                aria-label="reply"
              >
                reply
              </button>
            `
          : nothing}
        ${this.canIssue
          ? html`
              <button
                class="btn-hover danger issue-button material-symbols-outlined"
                @click=${this.handleIssueClick}
                aria-label="report problem"
              >
                report_problem
              </button>
            `
          : nothing}
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

  static styles = [
    baseStyle,
    iconStyle,
    hoverButtonStyle,
    actionStyle,
    css`
      :host {
        display: block;
      }
      .reply-form-wrapper {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
    `,
  ];
}
