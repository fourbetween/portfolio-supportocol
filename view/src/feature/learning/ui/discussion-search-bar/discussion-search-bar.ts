import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";

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
    css`
      .search-container {
        width: 100%;
      }
      input {
        width: 100%;
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        outline: none;
      }
      input:focus {
        background-color: var(--color-canvas-default);
        border-color: var(--color-accent-fg);
        box-shadow: inset 0 0 0 1px var(--color-accent-fg);
      }
    `,
  ];
}
