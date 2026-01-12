import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentContextStyle } from "../../../../shared/style/comment-context";
import { iconStyle } from "../../../../shared/style/icon";
import "../../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../../model/comment";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-card/comment-card";
import "../comment-item/comment-item";

@customElement("dialogue-comment-context")
export class DialogueCommentContext extends LitElement {
  @property({ type: Array })
  path: Comment[] = [];

  @property({ type: Object })
  childCounts = new Map<string, number>();

  @property({ type: Object })
  frame?: CommentFrame;

  private renderItem(comment: Comment, isLast: boolean) {
    const childCount = this.childCounts.get(comment.id) || 0;
    return html`
      <ui-comment-type-badge
        .type=${comment.commentType}
      ></ui-comment-type-badge>
      ${isLast
        ? html`
            <dialogue-comment-item
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .frame=${this.frame}
            ></dialogue-comment-item>
          `
        : html`
            <dialogue-comment-card
              .comment=${comment}
              .activeChildrenCount=${childCount}
            ></dialogue-comment-card>
          `}
    `;
  }

  private renderSeparator() {
    return html`
      <div class="separator">
        <span class="material-symbols-outlined">north</span>
      </div>
    `;
  }

  render() {
    return html`
      <div class="container">
        ${join(
          this.path.map((comment, index) =>
            this.renderItem(comment, index === this.path.length - 1)
          ),
          this.renderSeparator()
        )}
      </div>
    `;
  }

  static styles = [baseStyle, iconStyle, commentContextStyle, css``];
}
