import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../../shared/style/base";
import { hoverButtonStyle } from "../../../../shared/style/hover-button";
import { iconStyle } from "../../../../shared/style/icon";
import { listStyles } from "../../../../shared/style/list";
import {
  LearningDiscussionDeleteEvent,
  LearningDiscussionSelectEvent,
} from "../../event/discussion";
import type { DiscussionSummary } from "../../model/discussion";
import "../discussion-status-badge/discussion-status-badge";

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
    const { theme, status, archivedAt } = this.summary;
    const classes = {
      item: true,
      "hover-container": true,
      archived: !!archivedAt,
    };
    return html`
      <div class=${classMap(classes)} @click=${this.handleSelect}>
        <div class="info">
          <span class="theme">${theme}</span>
        </div>
        <learning-discussion-status-badge
          class="status-badge"
          .status=${status}
        ></learning-discussion-status-badge>
        <button
          class="btn-hover danger delete-button"
          aria-label="delete"
          @click=${this.handleDelete}
        >
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
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
        gap: 4px;
        flex: 1;
      }
      .theme {
        font-size: 0.9rem;
        color: var(--color-accent-fg);
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
