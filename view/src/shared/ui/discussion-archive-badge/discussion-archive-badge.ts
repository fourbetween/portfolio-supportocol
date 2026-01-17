import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../style/base";
import { iconStyle } from "../../style/icon";

@customElement("ui-discussion-archive-badge")
export class DiscussionArchiveBadge extends LitElement {
  @property({ type: Boolean })
  archived = false;

  render() {
    if (!this.archived) {
      return nothing;
    }

    return html`
      <div class="archive-badge">
        <span class="material-symbols-outlined">archive</span>
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
      .archive-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        border-radius: 2em;
        white-space: nowrap;
        color: var(--color-fg-muted);
        background-color: var(--color-neutral-subtle);
        border: 1px solid var(--color-border-default);
      }
      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
