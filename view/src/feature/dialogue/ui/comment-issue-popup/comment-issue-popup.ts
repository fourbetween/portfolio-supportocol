import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Issue } from "../../../../app/model/issue";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import "../../../../shared/ui/popup/popup";
import { DialogueIssueSelectEvent } from "../../event/comment";

@customElement("dialogue-comment-issue-popup")
export class DialogueCommentIssuePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  issues: Issue[] = [];

  @property({ type: Boolean })
  selectable = false;

  @property({ type: Array })
  excludedIssueIds: string[] = [];

  private _handleClose() {
    this.open = false;
  }

  private _handleSelect(issueId: string) {
    this.dispatchEvent(new DialogueIssueSelectEvent(issueId));
    this._handleClose();
  }

  render() {
    const displayIssues = this.selectable
      ? this.issues.filter((i) => !this.excludedIssueIds.includes(i.id))
      : this.issues;

    return html`
      <ui-popup .open=${this.open} @close=${this._handleClose}>
        <div slot="header">
          ${this.selectable ? "Add Issue" : "Comment Issues"}
        </div>
        <div slot="main">
          ${displayIssues.length === 0
            ? html`
                <p>No issues found.</p>
              `
            : html`
                <div class="issue-list">
                  ${displayIssues.map(
                    (issue) => html`
                      <div
                        class="issue-item ${this.selectable ? "clickable" : ""}"
                        @click=${this.selectable
                          ? () => this._handleSelect(issue.id)
                          : nothing}
                      >
                        <div class="issue-type">${issue.issueType}</div>
                        <div class="issue-description">
                          ${issue.description}
                        </div>
                        ${this.selectable
                          ? html`
                              <div class="select-hint">Click to add</div>
                            `
                          : nothing}
                      </div>
                    `,
                  )}
                </div>
              `}
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>Close</button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .issue-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .issue-item {
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      .issue-item.clickable {
        cursor: pointer;
      }
      .issue-item.clickable:hover {
        background-color: var(--color-surface-variant, #f0f0f0);
      }
      .issue-type {
        font-weight: bold;
        color: var(--color-error, #d32f2f);
        font-size: 0.9em;
        margin-bottom: 4px;
      }
      .issue-description {
        white-space: pre-wrap;
      }
      .select-hint {
        font-size: 0.8em;
        color: var(--color-outline, #757575);
        margin-top: 4px;
        text-align: right;
      }
    `,
  ];
}
