import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import "../../../shared/ui/icons/icon-lock";
import "../../../shared/ui/icons/icon-public";
import type { DiscussionStatus } from "../model/discussion";

@customElement("learning-discussion-status-badge")
export class LearningDiscussionStatusBadge extends LitElement {
  @property({ type: String })
  status?: DiscussionStatus;

  render() {
    if (!this.status) return nothing;

    return html`
      <div class="status-badge ${this.status}">
        ${this.status === "public"
          ? html`
              <ui-icon-public></ui-icon-public>
            `
          : html`
              <ui-icon-lock></ui-icon-lock>
            `}
      </div>
    `;
  }

  static styles = [
    baseStyle,
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
