import { msg } from "@lit/localize";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../shared/style/base";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { listStyles } from "../../../shared/style/list";
import "../../../shared/ui/icons/icon-chat-bubble";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-report";
import {
  LearningDiscussionDeleteEvent,
  LearningDiscussionSelectEvent,
} from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";
import "./discussion-status-badge";

@customElement("learning-discussion-item")
export class LearningDiscussionItem extends LitElement {
  @property({ type: Object })
  summary!: DiscussionSummary;

  private handleSelect() {
    this.dispatchEvent(new LearningDiscussionSelectEvent(this.summary.id));
  }

  private handleDelete(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(new LearningDiscussionDeleteEvent(this.summary.id));
  }

  render() {
    const { theme, status, archivedAt, proposedCommentsCount, issuesCount } =
      this.summary;
    const classes = {
      item: true,
      "hover-container": true,
      archived: !!archivedAt,
    };
    return html`
      <div class=${classMap(classes)} @click=${this.handleSelect}>
        <div class="info">
          <span class="theme">${theme}</span>
          <div class="stats">
            ${proposedCommentsCount > 0
              ? html`
                  <div class="stat-item" title=${msg("Proposed comments")}>
                    <ui-icon-chat-bubble></ui-icon-chat-bubble>
                    <span class="count">${proposedCommentsCount}</span>
                  </div>
                `
              : nothing}
            ${issuesCount > 0
              ? html`
                  <div class="stat-item" title=${msg("Issues")}>
                    <ui-icon-report></ui-icon-report>
                    <span class="count">${issuesCount}</span>
                  </div>
                `
              : nothing}
          </div>
        </div>
        <learning-discussion-status-badge
          class="status-badge"
          .status=${status}
        ></learning-discussion-status-badge>
        <button
          class="btn-hover danger delete-button"
          aria-label=${msg("delete")}
          @click=${this.handleDelete}
        >
          <ui-icon-delete></ui-icon-delete>
        </button>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    hoverButtonStyle,
    listStyles,
    css`
      .item.archived {
        background-color: var(--color-canvas-subtle);
      }
      .item.archived:hover {
        background-color: var(--color-canvas-inset);
      }
      .info {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
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
      .count {
        font-size: 0.8rem;
      }
      .status-badge {
        position: absolute;
        bottom: 8px;
        right: 8px;
      }
      .delete-button {
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
      }
    `,
  ];
}
