import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TouchController } from "../../../../app/controller/touch";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import { DialogueCommentSelectEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-card/comment-card";
import "../comment-reply-form/comment-reply-form";

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

  private touch = new TouchController(this);

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

  render() {
    if (!this.comment) return html``;

    return html`
      <div class="hover-container">${this.renderCommentContent()}</div>
      ${this.mode === "reply"
        ? html`
            <div class="reply-form-wrapper">
              <dialogue-comment-reply-form
                .parentCommentId=${this.comment.id}
                .frame=${this.frame}
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
        @dialogue-comment-select=${this.handleCommentSelect}
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
      .reply-form-wrapper {
        margin-left: 8px;
        padding-left: 8px;
        margin-top: 8px;
      }
    `,
  ];
}
