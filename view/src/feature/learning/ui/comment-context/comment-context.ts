import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { join } from "lit/directives/join.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { SelectCommentEvent } from "../../event/comment";
import type { Comment } from "../../model/comment";
import "../comment-card/comment-card";
import "../comment-item/comment-item";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-context")
export class LearningCommentContext extends LitElement {
  @property({ type: Array })
  path: Comment[] = [];

  @property({ type: Object })
  childCounts = new Map<string, number>();

  @property({ type: Array })
  availableTypes: string[] = [];

  private handleCommentClick(comment: Comment) {
    this.dispatchEvent(new SelectCommentEvent(comment.id));
  }

  private renderItem(comment: Comment, isLast: boolean) {
    const childCount = this.childCounts.get(comment.id) || 0;
    return html`
      <learning-comment-type-badge
        .type=${comment.commentType}
      ></learning-comment-type-badge>
      ${isLast
        ? html`
            <learning-comment-item
              .comment=${comment}
              .activeChildrenCount=${childCount}
              .availableTypes=${this.availableTypes}
            ></learning-comment-item>
          `
        : html`
            <learning-comment-card
              .comment=${comment}
              .activeChildrenCount=${childCount}
              @click=${() => this.handleCommentClick(comment)}
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

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .container {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      learning-comment-card {
        cursor: pointer;
      }
      .separator {
        display: flex;
        justify-content: center;
        color: var(--color-fg-muted);
        margin: 4px 0;
      }
      .material-symbols-outlined {
        font-size: 20px;
      }
    `,
  ];
}
