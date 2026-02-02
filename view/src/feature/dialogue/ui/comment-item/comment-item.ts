import { consume } from "@lit/context";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { issuesContext } from "../../../../app/context/issues";
import { TouchController } from "../../../../app/controller/touch";
import type { Issue } from "../../../../app/model/issue";
import { actionStyle } from "../../../../shared/style/action";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  DialogueCommentIssueAddEvent,
  DialogueCommentSelectEvent,
  DialogueIssueSelectEvent,
} from "../../event/comment";
import type { Comment } from "../../model/comment";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-card/comment-card";
import "../comment-issue-popup/comment-issue-popup";
import "../comment-reply-form/comment-reply-form";

@customElement("dialogue-comment-item")
export class DialogueCommentItem extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  @property({ type: Object })
  frame?: CommentFrame;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  archived = false;

  @state()
  private mode: "view" | "reply" = "view";

  @state()
  private issuePopupOpen = false;

  @consume({ context: issuesContext, subscribe: true })
  @property({ attribute: false })
  allIssues: Issue[] = [];

  private touch = new TouchController(this);

  private get canReply() {
    if (this.readonly) return false;
    if (this.archived || this.comment?.archivedAt) return false;
    if (!this.comment || !this.frame) return false;
    return this.frame.paths.some((p) => p.parent === this.comment?.commentType);
  }

  private get canAddIssue() {
    if (this.readonly) return false;
    if (this.archived || this.comment?.archivedAt) return false;
    return !!this.comment;
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

  private handleAddIssueClick(e: Event) {
    e.stopPropagation();
    this.issuePopupOpen = true;
  }

  private handleIssueSelect(e: DialogueIssueSelectEvent) {
    if (this.comment) {
      this.dispatchEvent(
        new DialogueCommentIssueAddEvent(this.comment.id, e.issueId),
      );
    }
    this.issuePopupOpen = false;
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
                .parentCommentType=${this.comment.commentType}
                .frame=${this.frame}
                @dialogue-comment-create=${() => (this.mode = "view")}
                @dialogue-comment-create-cancel=${() => (this.mode = "view")}
              ></dialogue-comment-reply-form>
            </div>
          `
        : nothing}
      <dialogue-comment-issue-popup
        .open=${this.issuePopupOpen}
        .issues=${this.allIssues}
        .selectable=${true}
        .excludedIssueIds=${(this.comment.issues || []).map((i) => i.issueId)}
        @dialogue-issue-select=${this.handleIssueSelect}
        @close=${() => (this.issuePopupOpen = false)}
      ></dialogue-comment-issue-popup>
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
        ${this.canAddIssue
          ? html`
              <button
                class="btn-hover danger issue-button material-symbols-outlined"
                @click=${this.handleAddIssueClick}
                aria-label="add issue"
              >
                report
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
