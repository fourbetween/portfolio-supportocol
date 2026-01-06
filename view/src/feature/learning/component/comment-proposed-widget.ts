import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { titleStyle } from "../../../shared/style/title";
import {
  CommentDeletedEvent,
  CommentSelectEvent,
  CommentUpdatedEvent,
  ProposedCommentAcceptEvent,
  ProposedCommentRejectEvent,
  ProposedCommentSelectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import { commentRepository } from "../repository/comment-repository";
import "../ui/proposed-comment-list/proposed-comment-list";

@customElement("learning-comment-proposed-widget")
export class LearningCommentProposedWidget extends LitElement {
  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  private get proposedComments(): Comment[] {
    return this.comments?.filter((c) => c.status === "proposed") ?? [];
  }

  private async handleAccept(e: ProposedCommentAcceptEvent) {
    if (!this.discussionId) return;
    const comment = e.comment;

    try {
      const data = await commentRepository.updateStatus(
        this.discussionId,
        comment.id,
        "active"
      );

      showToast(this, "Comment activated.", "success", 2000);
      this.dispatchEvent(new CommentUpdatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleReject(e: ProposedCommentRejectEvent) {
    if (!this.discussionId) return;
    const comment = e.comment;
    try {
      await commentRepository.delete(this.discussionId, comment.id);

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(new CommentDeletedEvent(comment.id));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleSelect(e: ProposedCommentSelectEvent) {
    const comment = e.comment;
    this.dispatchEvent(
      new CommentSelectEvent(comment.parentCommentId || undefined)
    );
  }

  render() {
    if (this.proposedComments.length === 0) {
      return html``;
    }

    return html`
      <section>
        <div class="section-title">Proposed Comments</div>
        <learning-proposed-comment-list
          .comments=${this.proposedComments}
          @proposed-comment-accept=${this.handleAccept}
          @proposed-comment-reject=${this.handleReject}
          @proposed-comment-select=${this.handleSelect}
        ></learning-proposed-comment-list>
      </section>
    `;
  }

  static styles = [
    baseStyle,
    titleStyle,
    css`
      :host {
        display: block;
      }
      section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        border-radius: 6px;
      }
    `,
  ];
}
