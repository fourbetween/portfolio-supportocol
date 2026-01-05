import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
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

  render() {
    if (this.comments.length === 0) {
      return html`
        <div class="empty">No proposed comments found.</div>
      `;
    }
    return html`
      <div class="list">${this.comments.map((c) => this.renderComment(c))}</div>
    `;
  }

  private renderComment(c: Comment) {
    return html`
      <div class="item hover-container">
        <div class="comment-container">
          <learning-comment-type-badge
            .type=${c.commentType}
          ></learning-comment-type-badge>
          <learning-comment-card
            class="clickable"
            .comment=${c}
            @click=${() =>
              this.dispatchEvent(new SelectProposedCommentEvent(c))}
          ></learning-comment-card>
        </div>
        <button
          class="btn-hover success accept-button"
          aria-label="check"
          @click=${() => this.dispatchEvent(new AcceptProposedCommentEvent(c))}
        >
          <span class="material-symbols-outlined">check</span>
        </button>
        <button
          class="btn-hover danger reject-button"
          aria-label="close"
          @click=${() => this.dispatchEvent(new RejectProposedCommentEvent(c))}
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
