import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import type { DiscussionStatus } from "../model/discussion";

@customElement("learning-discussion-status-badge")
export class LearningDiscussionStatusBadge extends LitElement {
  @property({ type: String })
  status?: DiscussionStatus;

  render() {
    if (!this.status) return nothing;

    const icon = this.status === "public" ? "public" : "lock";

    return html`
      <div class="status-badge ${this.status}">
        <span class="material-symbols-outlined">${icon}</span>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      :host {
        display: inline-block;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        border-radius: 2em;
        white-space: nowrap;
        border: 1px solid transparent;
      }
      .material-symbols-outlined {
        font-size: 16px;
      }
      .public {
        color: var(--color-success-fg);
        background-color: var(--color-success-subtle);
        border-color: var(--color-success-muted);
      }
      .private {
        color: var(--color-fg-muted);
        background-color: var(--color-neutral-subtle);
        border-color: var(--color-border-default);
      }
    `,
  ];
}
