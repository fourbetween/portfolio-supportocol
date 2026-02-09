import { msg } from "@lit/localize";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TouchController } from "../../../app/controller/touch";
import { baseStyle } from "../../../shared/style/base";
import { titleStyle } from "../../../shared/style/title";
import type { Comment } from "../model/comment";
import "../ui/proposed-comment-list";

@customElement("learning-comment-proposed-widget")
export class LearningCommentProposedWidget extends LitElement {
  private touch = new TouchController(this);

  @property({ type: String })
  discussionId?: string;

  @property({ type: Array })
  comments?: Comment[];

  @property({ type: Boolean })
  readonly = false;

  private get proposedComments(): Comment[] {
    return this.comments?.filter((c) => c.status === "proposed") ?? [];
  }

  render() {
    if (this.proposedComments.length === 0) {
      return nothing;
    }

    return html`
      <section>
        ${!this.touch.isTouchDevice
          ? html`
              <div class="section-title">${msg("Proposed Comments")}</div>
            `
          : nothing}
        <learning-proposed-comment-list
          .comments=${this.proposedComments}
        ></learning-proposed-comment-list>
      </section>
    `;
  }

  static styles = [
    baseStyle,
    titleStyle,
    css`
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
