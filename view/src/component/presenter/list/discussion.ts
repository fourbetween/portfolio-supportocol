import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";

export interface DiscussionView extends Discussion {
  projectName: string;
  commentCount: number;
  updatedAtFormatted: string;
}

@customElement("discussion-list-presenter")
export class DiscussionListPresenter extends LitElement {
  @property({ type: Array })
  discussions: DiscussionView[] = [];

  render() {
    return html`
      <div class="sidebar-heading">
        最近の議論
        <a
          href="/view/sample/popup/discussion/create.html"
          class="btn btn-primary btn-sm"
        >
          新しい議論を開始
        </a>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>最近のアクティビティ</h3>
        </div>
        <div class="card-body">
          <ul class="list-group">
            ${this.discussions.map(
              (discussion) => html`
                <li class="list-group-item discussion-item">
                  <div class="discussion-icon">
                    <svg
                      aria-hidden="true"
                      height="16"
                      viewBox="0 0 16 16"
                      version="1.1"
                      width="16"
                      data-view-component="true"
                      fill="currentColor"
                    >
                      <path
                        d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                      ></path>
                      <path
                        d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"
                      ></path>
                    </svg>
                  </div>
                  <div class="discussion-content">
                    <a
                      href="/view/sample/page/discussion/detail.html"
                      class="discussion-title"
                    >
                      ${discussion.theme}
                    </a>
                    <div class="discussion-meta">
                      プロジェクト:
                      <a href="#">${discussion.projectName}</a>
                      • 更新: ${discussion.updatedAtFormatted} • コメント:
                      ${discussion.commentCount}
                    </div>
                  </div>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .sidebar-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: 600;
        font-size: 14px;
      }

      .card {
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .card-header {
        background-color: var(--color-canvas-subtle);
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
        border-top-left-radius: 6px;
        border-top-right-radius: 6px;
      }

      .card-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .list-group {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .list-group-item {
        border-top: 1px solid var(--color-border-muted);
        padding: 16px;
        display: flex;
        gap: 8px;
      }

      .list-group-item:first-child {
        border-top: none;
      }

      .discussion-icon {
        color: var(--color-btn-primary-bg);
        margin-top: 2px;
      }

      .discussion-content {
        flex: 1;
      }

      .discussion-title {
        font-weight: 600;
        color: var(--color-fg-default);
        text-decoration: none;
        font-size: 16px;
        display: block;
        margin-bottom: 4px;
      }

      .discussion-title:hover {
        color: var(--color-accent-fg);
        text-decoration: underline;
      }

      .discussion-meta {
        font-size: 12px;
        color: var(--color-fg-muted);
      }

      .discussion-meta a {
        color: var(--color-fg-muted);
        text-decoration: none;
      }

      .discussion-meta a:hover {
        color: var(--color-accent-fg);
        text-decoration: underline;
      }
    `,
  ];
}
