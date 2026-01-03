import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { titleStyle } from "../../../shared/style/title";
import type { Comment } from "../model/comment";
import { commentRepository } from "../repository/comment-repository";
import "../ui/proposed-comment-list/proposed-comment-list";

@customElement("learning-comment-proposed-widget")
export class LearningCommentProposedWidget extends LitElement {
  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  @state()
  private proposedComments: Comment[] = [];

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.proposedComments =
        this.comments?.filter((c) => c.status === "proposed") ?? [];
    }
  }

  private async handleAccept(comment: Comment) {
    if (!this.discussionId) return;

    try {
      const data = await commentRepository.updateStatus(
        this.discussionId,
        comment.id,
        "active"
      );

      showToast(this, "Comment activated.", "success", 2000);
      this.dispatchEvent(
        new CustomEvent("comment-updated", {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private async handleReject(comment: Comment) {
    if (!this.discussionId) return;
    if (!confirm("Are you sure you want to delete this proposed comment?"))
      return;

    try {
      await commentRepository.delete(this.discussionId, comment.id);

      showToast(this, "Comment deleted.", "success", 2000);
      this.dispatchEvent(
        new CustomEvent("comment-deleted", {
          detail: { id: comment.id },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleClick(comment: Comment) {
    this.dispatchEvent(
      new CustomEvent("select-comment", {
        detail: { id: comment.parentCommentId },
        bubbles: true,
        composed: true,
      })
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
          .onAccept=${(c: Comment) => this.handleAccept(c)}
          .onReject=${(c: Comment) => this.handleReject(c)}
          .onClick=${(c: Comment) => this.handleClick(c)}
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
