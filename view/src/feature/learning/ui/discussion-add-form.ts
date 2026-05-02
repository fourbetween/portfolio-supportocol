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

  @state()
  private _sourceType: "text" | "url" | "" = "";

  @state()
  private _sourceBody = "";

  get value(): {
    theme: string;
    premise: string;
    sourceType?: "text" | "url";
    sourceBody?: string;
  } {
    return {
      theme: this._theme,
      premise: this._premise,
      ...(this._sourceType
        ? { sourceType: this._sourceType, sourceBody: this._sourceBody }
        : {}),
    };
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

  private _handleSourceTypeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this._sourceType = select.value as "text" | "url" | "";
    this._sourceBody = "";
  }

  private _handleSourceBodyInput(e: InputEvent) {
    const el = e.target as HTMLInputElement | HTMLTextAreaElement;
    this._sourceBody = el.value;
  }

  reset() {
    this._theme = "";
    this._premise = "";
    this._sourceType = "";
    this._sourceBody = "";
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
        <div class="field">
          <select
            .value=${live(this._sourceType)}
            @change=${this._handleSourceTypeChange}
            aria-label=${msg("Source type")}
          >
            <option value="">${msg("No source")}</option>
            <option value="url">${msg("URL")}</option>
            <option value="text">${msg("Text")}</option>
          </select>
        </div>
        ${this._sourceType === "url"
          ? html`
              <div class="field">
                <input
                  type="url"
                  .value=${live(this._sourceBody)}
                  @input=${this._handleSourceBodyInput}
                  placeholder=${msg("Source URL")}
                  aria-label=${msg("Source URL")}
                />
              </div>
            `
          : ""}
        ${this._sourceType === "text"
          ? html`
              <div class="field">
                <textarea
                  .value=${live(this._sourceBody)}
                  @input=${this._handleSourceBodyInput}
                  placeholder=${msg("Source text")}
                  aria-label=${msg("Source text")}
                  rows="8"
                ></textarea>
              </div>
            `
          : ""}
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
      textarea,
      select {
        width: 100%;
        box-sizing: border-box;
      }
    `,
  ];
}
