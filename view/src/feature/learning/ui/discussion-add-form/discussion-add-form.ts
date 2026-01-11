import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import { LearningDiscussionCreateEvent } from "../../event/discussion";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @state()
  private _theme = "";

  private get _canSubmit() {
    return this._theme.trim().length > 0;
  }

  private _handleInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._theme = input.value;
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();
    if (this._canSubmit) {
      this.dispatchEvent(new LearningDiscussionCreateEvent(this._theme, "private"));
      this._theme = "";
    }
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <input
          type="text"
          .value=${live(this._theme)}
          @input=${this._handleInput}
          placeholder="New discussion theme"
          aria-label="New discussion theme"
        />
        <button
          type="submit"
          class="btn btn-primary"
          ?disabled=${!this._canSubmit}
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
        width: 100%;
      }
      input {
        flex: 1;
        min-width: 0;
      }
      button {
        flex-shrink: 0;
      }
    `,
  ];
}
