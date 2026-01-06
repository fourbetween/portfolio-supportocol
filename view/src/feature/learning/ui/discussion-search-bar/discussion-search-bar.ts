import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { inputStyle } from "../../../../shared/style/input";
import { DiscussionSearchEvent } from "../../event/discussion";

@customElement("learning-discussion-search-bar")
export class LearningDiscussionSearchBar extends LitElement {
  @property({ type: String })
  value = "";

  @query("input")
  private _inputElement!: HTMLInputElement;

  private _handleInput() {
    this.dispatchEvent(new DiscussionSearchEvent(this._inputElement.value));
  }

  render() {
    return html`
      <div class="search-container">
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
    css`
      :host {
        display: block;
        width: 100%;
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
