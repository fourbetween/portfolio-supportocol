import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../../shared/style/base";
import type { Comment } from "../../model/comment";

@customElement("learning-comment-card")
export class LearningCommentCard extends LitElement {
  @property({ type: Object })
  comment?: Comment;

  @property({ type: Number })
  activeChildrenCount = 0;

  render() {
    if (!this.comment) return html``;

    return html`
      <div class=${classMap(this._cardClasses)}>
        <div class="content">${this.comment.content}</div>
        <div class="footer">
          ${this.activeChildrenCount > 0
            ? html`
                <div class="child-count">${this.activeChildrenCount}</div>
              `
            : nothing}
          <div class="created-at">
            ${this._formatDate(this.comment.createdAt)}
          </div>
        </div>
      </div>
    `;
  }

  private get _cardClasses() {
    return {
      "card-body": true,
      proposed: this.comment?.status === "proposed",
    };
  }

  private _formatDate(dateStr: string) {
    return new Date(dateStr).toISOString().replace("T", " ").substring(0, 19);
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        overflow: hidden;
        position: relative;
      }

      .card-body {
        display: flex;
        flex-direction: column;
      }

      .card-body.proposed {
        background-color: var(--color-canvas-inset);
      }

      .content {
        padding: 16px;
        padding-bottom: 24px;
        font-size: 14px;
        line-height: 1.5;
        color: var(--color-fg-default);
      }

      .footer {
        position: absolute;
        bottom: 8px;
        right: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .child-count {
        padding: 2px 6px;
        font-size: 11px;
        font-weight: bold;
        color: var(--color-fg-muted);
        background-color: var(--color-canvas-subtle);
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
        line-height: 1;
      }

      .created-at {
        font-size: 11px;
        color: var(--color-fg-muted);
      }
    `,
  ];
}
