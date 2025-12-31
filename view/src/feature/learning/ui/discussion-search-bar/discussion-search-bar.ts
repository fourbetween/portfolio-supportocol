import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { inputStyle } from "../../../../shared/style/input";

@customElement("learning-discussion-search-bar")
export class LearningDiscussionSearchBar extends LitElement {
  @property({ type: String })
  value = "";

  @property({ attribute: false })
  onInput?: (value: string) => void;

  private _handleInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this.onInput?.(input.value);
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
        background-color: var(--color-canvas-subtle);
      }
      input:focus {
        background-color: var(--color-canvas-default);
      }
    `,
  ];
}
