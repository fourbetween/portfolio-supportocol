import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  AcceptProposedCommentEvent,
  RejectProposedCommentEvent,
  SelectProposedCommentEvent,
} from "../../event/comment";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-proposed-comment-list")
export class LearningProposedCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  private onSelect(comment: Comment) {
    this.dispatchEvent(new SelectProposedCommentEvent(comment));
  }

  private onAccept(comment: Comment) {
    this.dispatchEvent(new AcceptProposedCommentEvent(comment));
  }

  private onReject(comment: Comment) {
    this.dispatchEvent(new RejectProposedCommentEvent(comment));
  }

  render() {
    if (this.comments.length === 0) {
      return html`
        <div class="empty">No proposed comments found.</div>
      `;
    }
    return html`
      <div class="list">
        ${repeat(
          this.comments,
          (comment) => comment.id,
          (comment) => this.renderComment(comment)
        )}
      </div>
    `;
  }

  private renderComment(comment: Comment) {
    return html`
      <div class="item hover-container">
        <div class="comment-container">
          <learning-comment-type-badge
            .type=${comment.commentType}
          ></learning-comment-type-badge>
          <learning-comment-card
            class="clickable"
            .comment=${comment}
            @click=${() => this.onSelect(comment)}
          ></learning-comment-card>
        </div>
        <button
          class="btn-hover success accept-button"
          aria-label="check"
          @click=${() => this.onAccept(comment)}
        >
          <span class="material-symbols-outlined">check</span>
        </button>
        <button
          class="btn-hover danger reject-button"
          aria-label="close"
          @click=${() => this.onReject(comment)}
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    hoverButtonStyle,
    css`
      .empty {
        padding: 16px;
        text-align: center;
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .item {
        position: relative;
        display: flex;
        flex-direction: column;
        background-color: var(--color-canvas-default);
      }
      .comment-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .clickable {
        cursor: pointer;
      }
      .clickable:hover {
        opacity: 0.8;
      }
      .accept-button {
        bottom: -16px;
        left: 8px;
      }
      .reject-button {
        bottom: -16px;
        left: 48px;
      }
    `,
  ];
}
