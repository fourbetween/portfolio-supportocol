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

  @property({ type: Boolean })
  readonly = false;

  private renderItem(comment: Comment, isLast: boolean, isArchived: boolean) {
    const childCount = this.childCounts.get(comment.id) || 0;
    return html`
      <ui-comment-type-badge .type=${comment.type}></ui-comment-type-badge>
      ${isLast && !this.readonly
        ? html`
            <dialogue-comment-item
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .frame=${this.frame}
              .archived=${isArchived}
              .readonly=${this.readonly}
            ></dialogue-comment-item>
          `
        : html`
            <dialogue-comment-card
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .archived=${isArchived}
              .readonly=${this.readonly}
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
    let subtreeArchived = false;
    return html`
      <div class="container">
        ${join(
          this.path.map((comment, index) => {
            if (comment.archivedAt) {
              subtreeArchived = true;
            }
            return this.renderItem(
              comment,
              index === this.path.length - 1,
              subtreeArchived,
            );
          }),
          this.renderSeparator(),
        )}
      </div>
    `;
  }

  static styles = [baseStyle, iconStyle, commentContextStyle, css``];
}
