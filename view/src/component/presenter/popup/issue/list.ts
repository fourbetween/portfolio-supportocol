import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { Issue } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import type { BasePopupPresenter } from "../base";

type IssueType = "contradiction" | "circular_logic";

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  contradiction: "矛盾",
  circular_logic: "循環論法",
};

@customElement("list-issue-popup-presenter")
export class ListIssuePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private popup!: BasePopupPresenter;

  @property({ attribute: false })
  issues: Issue[] = [];

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">指摘一覧</span>
        <div slot="main">
          ${this.issues.length === 0
            ? html`
                <p class="empty-message">指摘がありません</p>
              `
            : html`
                <ul class="issue-list">
                  ${this.issues.map(
                    (issue) => html`
                      <li class="issue-item">
                        <div class="issue-header">
                          <span
                            class="issue-type-badge"
                            data-type="${issue.issueType}"
                          >
                            ${ISSUE_TYPE_LABELS[issue.issueType]}
                          </span>
                        </div>
                        <div class="issue-description">
                          ${issue.description}
                        </div>
                      </li>
                    `
                  )}
                </ul>
              `}
        </div>
        <div slot="footer">
          <button class="btn-close" @click=${this.close}>閉じる</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.popup.open();
  }

  close() {
    this.popup.close();
  }

  static styles = [
    baseStyle,
    css`
      .issue-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .issue-item {
        padding: 12px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .issue-header {
        margin-bottom: 8px;
      }

      .issue-type-badge {
        display: inline-block;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        border-radius: 4px;
      }

      .issue-type-badge[data-type="contradiction"] {
        color: #ffffff;
        background-color: #cf222e;
      }

      .issue-type-badge[data-type="circular_logic"] {
        color: #ffffff;
        background-color: #9a6700;
      }

      .issue-description {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.6;
      }

      .empty-message {
        text-align: center;
        color: var(--color-fg-muted);
        padding: 16px;
      }

      .btn-close {
        padding: 6px 16px;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-close:hover {
        background-color: var(--color-canvas-subtle);
      }
    `,
  ];
}
