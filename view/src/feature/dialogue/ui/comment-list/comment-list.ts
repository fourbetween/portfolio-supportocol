import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";

@customElement("dialogue-comment-list")
export class DialogueCommentList extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  render() {
    const sortedComments = [...this.comments].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return html`
      <div class="list-container">
        ${sortedComments.map(
          (comment) => html`
            <dialogue-comment-card .comment=${comment}></dialogue-comment-card>
          `
        )}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .list-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
      }
    `,
  ];
}
