import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @property({ attribute: false })
  onSubmit?: (theme: string) => void;

  @state()
  private _theme = "";

  private _handleInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._theme = input.value;
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();
    if (this._theme.trim()) {
      this.onSubmit?.(this._theme);
      this._theme = "";
    }
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input
          type="text"
          .value=${this._theme}
          @input=${this._handleInput}
          placeholder="New discussion theme"
          aria-label="New discussion theme"
        />
        <button type="submit" ?disabled=${!this._theme.trim()}>
          New discussion
        </button>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    css`
      form {
        display: flex;
        gap: 8px;
      }
      input {
        flex: 1;
        padding: 5px 12px;
        font-size: 14px;
        line-height: 20px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        outline: none;
      }
      input:focus {
        border-color: var(--color-accent-fg);
        box-shadow: inset 0 0 0 1px var(--color-accent-fg);
      }
      button {
        padding: 5px 16px;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        color: var(--color-btn-primary-text);
        background-color: var(--color-btn-primary-bg);
        border: 1px solid rgba(27, 31, 36, 0.15);
        border-radius: 6px;
        cursor: pointer;
      }
      button:hover {
        background-color: var(--color-btn-primary-hover-bg);
      }
      button:disabled {
        background-color: #94d3a2;
        cursor: not-allowed;
      }
    `,
  ];
}
