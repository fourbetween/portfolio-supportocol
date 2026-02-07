import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import { listStyles } from "../../../shared/style/list";
import { DialogueDiscussionSelectEvent } from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";

@customElement("dialogue-discussion-item")
export class DialogueDiscussionItem extends LitElement {
  @property({ type: Object })
  summary!: DiscussionSummary;

  private handleClick() {
    this.dispatchEvent(
      new DialogueDiscussionSelectEvent(
        this.summary.workspaceId,
        this.summary.id,
      ),
    );
  }

  render() {
    const { theme, proposedCommentsCount, issuesCount } = this.summary;
    return html`
      <div class="item hover-container" @click=${this.handleClick}>
        <div class="info">
          <span class="theme">${theme}</span>
          <div class="stats">
            <div class="stat-item" title="Proposed comments">
              <span class="material-symbols-outlined">chat_bubble</span>
              <span class="count">${proposedCommentsCount}</span>
            </div>
            <div class="stat-item" title="Issues">
              <span class="material-symbols-outlined">report</span>
              <span class="count">${issuesCount}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    listStyles,
    css`
      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        flex: 1;
      }
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
      }
      .stats {
        display: flex;
        gap: 12px;
        color: var(--color-fg-muted);
      }
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .stat-item .material-symbols-outlined {
        font-size: 16px;
      }
      .count {
        font-size: 0.8rem;
      }
    `,
  ];
}
