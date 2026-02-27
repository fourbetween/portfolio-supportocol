import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../model/comment";
import "./comment-card";

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
        ${repeat(
          sortedComments,
          (comment) => comment.id,
          (comment) => html`
            <div class="comment-item">
              <ui-comment-type-badge
                .type=${comment.type}
              ></ui-comment-type-badge>
              <dialogue-comment-card
                .comment=${comment}
                .clickable=${true}
              ></dialogue-comment-card>
            </div>
          `,
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
        gap: 16px;
      }
      .comment-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
    `,
  ];
}
