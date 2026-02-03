import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import type { CommentIssue } from "../../model/comment";

@customElement("dialogue-issue-list")
export class DialogueIssueList extends LitElement {
  @property({ type: Array })
  issues: CommentIssue[] = [];

  render() {
    if (this.issues.length === 0) {
      return html`
        <div class="empty">No issues found.</div>
      `;
    }

    return html`
      <ul class="issue-list">
        ${this.issues.map(
          (issue) => html`
            <li class="issue-item">
              <span class="material-symbols-outlined icon">warning</span>
              <div class="content">
                <div class="title">${issue.title}</div>
                ${issue.description
                  ? html`
                      <div class="description">${issue.description}</div>
                    `
                  : html``}
              </div>
            </li>
          `,
        )}
      </ul>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: block;
      }
      .empty {
        color: var(--color-text-secondary);
        font-style: italic;
        padding: 8px;
      }
      .issue-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .issue-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--color-error);
        border-radius: 8px;
        background-color: var(--color-error-alpha, #fff5f5);
      }
      .icon {
        color: var(--color-error);
        flex-shrink: 0;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .title {
        font-weight: bold;
        color: var(--color-error);
      }
      .description {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        white-space: pre-wrap;
      }
    `,
  ];
}
