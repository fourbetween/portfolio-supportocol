import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentContextStyle } from "../../../../shared/style/comment-context";
import { iconStyle } from "../../../../shared/style/icon";
import "../../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-item/comment-item";

@customElement("learning-comment-context")
export class LearningCommentContext extends LitElement {
  @property({ type: Array })
  path: Comment[] = [];

  @property({ type: Object })
  childCounts = new Map<string, number>();

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ type: Boolean })
  readonly = false;

  private renderItem(comment: Comment, isLast: boolean, isArchived: boolean) {
    const childCount = this.childCounts.get(comment.id) || 0;
    return html`
      <ui-comment-type-badge .type=${comment.type}></ui-comment-type-badge>
      ${isLast
        ? html`
            <learning-comment-item
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .availableTypes=${this.availableTypes}
              .readonly=${this.readonly}
              .archived=${isArchived}
            ></learning-comment-item>
          `
        : html`
            <learning-comment-card
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .archived=${isArchived}
            ></learning-comment-card>
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
    let archived = false;
    return html`
      <div class="container">
        ${join(
          this.path.map((comment, index) => {
            archived = archived || !!comment.archivedAt;
            return this.renderItem(
              comment,
              index === this.path.length - 1,
              archived,
            );
          }),
          this.renderSeparator(),
        )}
      </div>
    `;
  }

  static styles = [baseStyle, iconStyle, commentContextStyle, css``];
}
