import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import "../ui/comment-frame-detail/comment-frame-detail";

@customElement("learning-comment-frame-widget")
export class LearningCommentFrameWidget extends LitElement {
  @property({ type: Array })
  comments: Comment[] = [];

  render() {
    const frame = deriveCommentFrame(this.comments);

    return html`
      <learning-comment-frame-detail
        .frame=${frame}
      ></learning-comment-frame-detail>
    `;
  }
}
