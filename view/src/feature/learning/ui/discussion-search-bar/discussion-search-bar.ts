import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import { SearchDiscussionEvent } from "../../event/discussion";

@customElement("learning-discussion-search-bar")
export class LearningDiscussionSearchBar extends LitElement {
  @property({ type: String })
  value = "";

  @query("input")
  private _inputElement!: HTMLInputElement;

  private _handleInput() {
    this.dispatchEvent(new SearchDiscussionEvent(this._inputElement.value));
  }

  render() {
    return html`
      <div class="search-container">
        <span class="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          .value=${this.value}
          @input=${this._handleInput}
          placeholder="Search discussions..."
          aria-label="Search discussions"
        />
      </div>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    iconStyle,
    css`
      :host {
        display: block;
        width: 100%;
      }
      .search-container {
        position: relative;
        display: flex;
        align-items: center;
      }
      .search-icon {
        position: absolute;
        left: 8px;
        color: var(--color-fg-muted);
        pointer-events: none;
        font-size: 20px;
      }
      input {
        width: 100%;
        padding-left: 32px;
        background-color: var(--color-canvas-subtle);
      }
      input:focus {
        background-color: var(--color-canvas-default);
      }
    `,
  ];
}
