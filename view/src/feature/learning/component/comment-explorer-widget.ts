import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Comment } from "../model/comment";
import "../ui/comment-tree/comment-tree";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ attribute: false })
  onCommentClick?: (comment: Comment) => void;

  render() {
    return html`
      <learning-comment-tree
        .comments=${this.comments}
        .onCommentClick=${this.onCommentClick}
      ></learning-comment-tree>
    `;
  }
}
