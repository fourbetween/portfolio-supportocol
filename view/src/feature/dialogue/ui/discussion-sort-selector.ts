import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { DialogueDiscussionSortChangeEvent } from "../event/discussion";
import type { DiscussionSort } from "../model/discussion";

@customElement("dialogue-discussion-sort-selector")
export class DialogueDiscussionSortSelector extends LitElement {
  @property({ type: String })
  sort: DiscussionSort = "lastCommentedAt";

  private handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const value = select.value as DiscussionSort;
    this.dispatchEvent(new DialogueDiscussionSortChangeEvent(value));
  }

  render() {
    return html`
      <div class="container">
        <label for="sort-select">${msg("Sort by")}</label>
        <select
          id="sort-select"
          .value=${this.sort}
          @change=${this.handleChange}
        >
          <option value="lastCommentedAt">${msg("Last commented")}</option>
          <option value="favoritesCount">${msg("Most favorited")}</option>
        </select>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--color-fg-muted);
      }

      select {
        padding: 4px 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
        font-size: 14px;
        cursor: pointer;
      }

      select:focus {
        outline: none;
        border-color: var(--color-accent-fg);
      }
    `,
  ];
}
