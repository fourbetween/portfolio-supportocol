import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import { CreateDiscussionEvent } from "../../event/discussion";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @state()
  private _theme = "";

  private _handleInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._theme = input.value;
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();
    if (this._theme.trim()) {
      this.dispatchEvent(new CreateDiscussionEvent(this._theme));
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
        <button
          type="submit"
          class="btn btn-primary"
          ?disabled=${!this._theme.trim()}
          title="New discussion"
        >
          <span class="material-symbols-outlined">add</span>
        </button>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    inputStyle,
    css`
      form {
        display: flex;
        gap: 8px;
      }
      input {
        flex: 1;
      }
    `,
  ];
}
