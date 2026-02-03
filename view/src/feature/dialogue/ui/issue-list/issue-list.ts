import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { emptyStyle } from "../../../../shared/style/list";
import type { CommentIssue } from "../../model/comment";

@customElement("dialogue-issue-list")
export class DialogueIssueList extends LitElement {
  @property({ type: Array })
  issues: CommentIssue[] = [];

  render() {
    return html`
      ${this.issues.length === 0
        ? html`
            <div class="empty">No issues found.</div>
          `
        : html`
            <ul class="issue-list">
              ${this.issues.map((issue) => this._renderIssue(issue))}
            </ul>
          `}
    `;
  }

  private _renderIssue(issue: CommentIssue) {
    return html`
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
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    emptyStyle,
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
        display: flex;
        gap: 12px;
        padding: 12px;
        border: 1px solid var(--color-danger-fg);
        border-radius: 8px;
      }
      .icon {
        color: var(--color-danger-fg);
        flex-shrink: 0;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .title {
        font-weight: bold;
        color: var(--color-danger-fg);
      }
      .description {
        font-size: 0.9rem;
        color: var(--color-fg-muted);
        white-space: pre-wrap;
      }
    `,
  ];
}
