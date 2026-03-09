import { msg } from "@lit/localize";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { emptyStyle } from "../../../shared/style/list";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-warning";
import { LearningIssueRemoveEvent } from "../event/issue";
import type { CommentIssue } from "../model/comment";

@customElement("learning-issue-list")
export class LearningIssueList extends LitElement {
  @property({ type: String })
  commentId = "";

  @property({ type: Array })
  issues: CommentIssue[] = [];

  @property({ type: Boolean })
  readonly = false;

  private _handleRemove(issueId: string) {
    this.dispatchEvent(new LearningIssueRemoveEvent(this.commentId, issueId));
  }

  render() {
    return html`
      ${this.issues.length === 0
        ? html`
            <div class="empty">${msg("No issues found.")}</div>
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
        <ui-icon-warning class="icon"></ui-icon-warning>
        <div class="content">
          <div class="title">${issue.title}</div>
          ${issue.description
            ? html`
                <div class="description">${issue.description}</div>
              `
            : html``}
        </div>
        ${this.readonly
          ? nothing
          : html`
              <button
                class="remove-button"
                @click=${() => this._handleRemove(issue.id)}
                title=${msg("Remove Issue")}
              >
                <ui-icon-delete></ui-icon-delete>
              </button>
            `}
      </li>
    `;
  }

  static styles = [
    baseStyle,
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
        align-items: flex-start;
      }
      .icon {
        color: var(--color-danger-fg);
        flex-shrink: 0;
        margin-top: 2px;
      }
      .content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex-grow: 1;
      }
      .title {
        font-weight: bold;
        color: var(--color-danger-fg);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .description {
        font-size: 0.9rem;
        color: var(--color-fg-muted);
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      .remove-button {
        background: none;
        border: none;
        color: var(--color-fg-muted);
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      .remove-button:hover {
        background-color: var(--color-canvas-subtle);
        color: var(--color-danger-fg);
      }
      .remove-button ui-icon-delete {
        font-size: 20px;
      }
    `,
  ];
}
