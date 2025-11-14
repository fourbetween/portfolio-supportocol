import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

// DiscussionCardに必要な最小限のプロパティ
export interface DiscussionCardProps {
  id: string;
  theme: string;
  authorName: string;
  commentCount: number;
}

@customElement("discussion-card-presenter")
export class DiscussionCardPresenter extends LitElement {
  @property({ type: Object })
  discussionCard!: DiscussionCardProps;

  render() {
    return html`
      <div class="card">
        <a href="#" class="theme-link">${this.discussionCard.theme}</a>
        <div class="card-footer">
          <div class="author-info">
            <p class="author-name">${this.discussionCard.authorName}</p>
          </div>
          <div class="comment-info">
            <span class="icon">💬</span>
            <p class="comment-count">${this.discussionCard.commentCount}</p>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .card {
        background: white;
        padding: 0.75rem;
        border-radius: 0.5rem;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        border: 1px solid rgb(208 215 222);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .theme-link {
        color: rgb(31 35 40);
        font-size: 0.875rem;
        font-weight: 500;
        line-height: normal;
        text-decoration: none;
      }

      .theme-link:hover {
        color: rgb(13 108 217);
        text-decoration: underline;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .author-info {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: rgb(101 109 118);
      }

      .author-name {
        font-size: 0.75rem;
        font-weight: 400;
        margin: 0;
      }

      .comment-info {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        color: rgb(101 109 118);
      }

      .icon {
        font-family: "Material Symbols Outlined";
        font-size: 16px;
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
      }

      .comment-count {
        font-size: 0.75rem;
        font-weight: 500;
        margin: 0;
      }

      :host([theme="dark"]) .card {
        background: rgb(16 24 34);
        border-color: rgb(48 54 61);
      }

      :host([theme="dark"]) .theme-link {
        color: rgb(230 237 243);
      }

      :host([theme="dark"]) .author-info,
      :host([theme="dark"]) .comment-info {
        color: rgb(139 148 158);
      }
    `,
  ];
}
