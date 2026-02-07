import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TouchController } from "../../../app/controller/touch";
import { baseStyle } from "../../../shared/style/base";
import { titleStyle } from "../../../shared/style/title";
import type { Comment } from "../model/comment";
import "../ui/issue-comment-list";

@customElement("learning-comment-issue-widget")
export class LearningCommentIssueWidget extends LitElement {
  private touch = new TouchController(this);

  @property({ type: Array })
  comments?: Comment[];

  private get commentsWithIssues(): Comment[] {
    return this.comments?.filter((c) => c.issues && c.issues.length > 0) ?? [];
  }

  render() {
    if (this.commentsWithIssues.length === 0) {
      return nothing;
    }

    return html`
      <section>
        ${!this.touch.isTouchDevice
          ? html`
              <div class="section-title">Comments with Issues</div>
            `
          : nothing}
        <learning-issue-comment-list
          .comments=${this.commentsWithIssues}
        ></learning-issue-comment-list>
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
