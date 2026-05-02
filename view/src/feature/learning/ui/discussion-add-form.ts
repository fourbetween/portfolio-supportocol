import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { baseStyle } from "../../../shared/style/base";
import { inputStyle } from "../../../shared/style/input";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @state()
  private _theme = "";

  @state()
  private _premise = "";

  get value(): { theme: string; premise: string } {
    return { theme: this._theme, premise: this._premise };
  }

  get isValid(): boolean {
    return this._theme.trim().length > 0;
  }

  private _handleThemeInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._theme = input.value;
  }

  private _handlePremiseInput(e: InputEvent) {
    const textarea = e.target as HTMLTextAreaElement;
    this._premise = textarea.value;
  }

  reset() {
    this._theme = "";
    this._premise = "";
  }

  render() {
    return html`
      <div class="fields">
        <div class="field">
          <input
            type="text"
            .value=${live(this._theme)}
            @input=${this._handleThemeInput}
            placeholder=${msg("Theme")}
            aria-label=${msg("Theme")}
          />
        </div>
        <div class="field">
          <textarea
            .value=${live(this._premise)}
            @input=${this._handlePremiseInput}
            placeholder=${msg("Premise (optional)")}
            aria-label=${msg("Premise")}
            rows="4"
          ></textarea>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    css`
      .fields {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      input,
      textarea {
        width: 100%;
        box-sizing: border-box;
      }
    `,
  ];
}
