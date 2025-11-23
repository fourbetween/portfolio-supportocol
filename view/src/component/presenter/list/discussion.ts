import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { Discussion } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { listStyle } from "../../../style/list";
import { pageStyle } from "../../../style/page";
import type {
  CreateDiscussionData,
  CreateDiscussionPopupPresenter,
} from "../popup/discussion/create";

@customElement("discussion-list-presenter")
export class DiscussionListPresenter extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  onCreate: (data: CreateDiscussionData) => Promise<void> = () =>
    Promise.resolve();

  @query("create-discussion-popup-presenter")
  private createPopup!: CreateDiscussionPopupPresenter;

  render() {
    const openDiscussions = this.discussions.filter((d) => d.status === "open");
    const closedDiscussions = this.discussions.filter(
      (d) => d.status === "closed"
    );
    const archivedDiscussions = this.discussions.filter(
      (d) => d.status === "archived"
    );

    return html`
      <div class="discussion-list-container">
        <div class="page-header">
          <h1 class="page-title">議論一覧</h1>
          <button
            class="btn btn-primary"
            @click=${() => this.createPopup.open()}
          >
            新規作成
          </button>
        </div>
        ${this.renderGroup("Open", openDiscussions, "status-open")}
        ${this.renderGroup("Closed", closedDiscussions, "status-closed")}
        ${this.renderGroup("Archived", archivedDiscussions, "status-archived")}
        <create-discussion-popup-presenter
          .onCreate=${this.onCreate}
        ></create-discussion-popup-presenter>
      </div>
    `;
  }

  private renderGroup(
    title: string,
    discussions: Discussion[],
    statusClass: string
  ) {
    if (discussions.length === 0) return html``;

    return html`
      <div class="status-header">
        ${this.renderStatusIcon(statusClass)} ${title}
      </div>
      <div class="list-group">
        ${discussions.map(
          (discussion) => html`
            <div class="list-group-item">
              <div class="discussion-icon">
                ${this.renderStatusIcon(statusClass)}
              </div>
              <div class="discussion-content">
                <a href="#" class="discussion-title">${discussion.theme}</a>
                <div class="discussion-meta">
                  <span class="status-badge ${statusClass}">${title}</span>
                  <span class="meta-item">
                    #${discussion.id.slice(0, 7)} opened on
                    ${new Date(discussion.createdAt).toLocaleDateString()} by
                    ${discussion.createdBy}
                  </span>
                  <span class="meta-item">・</span>
                  <span class="meta-item">
                    公開: ${this.getVisibilityLabel(discussion.visibilityLevel)}
                  </span>
                </div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private getVisibilityLabel(level: string) {
    switch (level) {
      case "everyone":
        return "全員";
      case "authenticated":
        return "ログインユーザー";
      case "owner":
        return "自分のみ";
      default:
        return level;
    }
  }

  private renderStatusIcon(statusClass: string) {
    if (statusClass === "status-open") {
      return html`
        <svg
          class="octicon ${statusClass}"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="16"
          height="16"
        >
          <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"></path>
          <path
            fill-rule="evenodd"
            d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"
          ></path>
        </svg>
      `;
    }
    if (statusClass === "status-closed") {
      return html`
        <svg
          class="octicon ${statusClass}"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="16"
          height="16"
        >
          <path
            d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"
          ></path>
        </svg>
      `;
    }
    if (statusClass === "status-archived") {
      return html`
        <svg
          class="octicon ${statusClass}"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          width="16"
          height="16"
        >
          <path
            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
          ></path>
        </svg>
      `;
    }
    return html``;
  }

  static styles = [
    baseStyle,
    listStyle,
    buttonStyle,
    pageStyle,
    css`
      .discussion-list-container {
        max-width: 980px;
        margin: 0 auto;
        padding: 20px;
      }
      .status-header {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        margin-top: 24px;
        margin-bottom: 8px;
        color: var(--color-fg-default);
      }
      .status-header:first-child {
        margin-top: 0;
      }
      .status-header svg {
        margin-right: 8px;
      }
      .discussion-icon {
        margin-right: 8px;
        padding-top: 2px;
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
      }
      .discussion-meta {
        font-size: 12px;
        color: var(--color-fg-muted);
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }
      .status-badge {
        display: inline-block;
        padding: 0 7px;
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        border: 1px solid transparent;
        border-radius: 2em;
        margin-right: 8px;
      }
      .status-open {
        color: #1a7f37;
        border-color: rgba(26, 127, 55, 0.4);
      }
      .status-header .status-open {
        fill: #1a7f37;
        border: none;
      }
      .status-closed {
        color: #8250df;
        border-color: rgba(130, 80, 223, 0.4);
      }
      .status-header .status-closed {
        fill: #8250df;
        border: none;
      }
      .status-archived {
        color: #57606a;
        border-color: rgba(87, 96, 106, 0.4);
      }
      .status-header .status-archived {
        fill: #57606a;
        border: none;
      }
      .meta-item {
        margin-right: 4px;
      }
    `,
  ];
}
