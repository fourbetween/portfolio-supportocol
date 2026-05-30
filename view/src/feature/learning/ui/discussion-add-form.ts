import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { getLocale } from "../../../localization";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/icons/icon-add";
import "../../../shared/ui/icons/icon-delete";
import type { DiscussionLanguage } from "../model/discussion";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @property({ type: Boolean })
  isFree = false;

  @state()
  private _theme = "";

  @state()
  private _premise = "";

  @state()
  private _language: DiscussionLanguage = getLocale() === "ja" ? "ja" : "en";

  @state()
  private _sourceText = "";

  @state()
  private _sourceUrls: string[] = [];

  @state()
  private _newUrl = "";

  get value(): {
    theme: string;
    premise: string;
    language: DiscussionLanguage;
    sourceText?: string;
    sourceUrls?: string[];
  } {
    return {
      theme: this._theme,
      premise: this._premise,
      language: this._language,
      ...(this._sourceText.trim() || this._sourceUrls.length > 0
        ? {
            sourceText: this._sourceText,
            sourceUrls: this._sourceUrls,
          }
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

  private _handleSourceTextInput(e: InputEvent) {
    const textarea = e.target as HTMLTextAreaElement;
    this._sourceText = textarea.value;
  }

  private _handleNewUrlInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._newUrl = input.value;
  }

  private _handleAddUrl() {
    const url = this._newUrl.trim();
    if (url && !this._sourceUrls.includes(url)) {
      this._sourceUrls = [...this._sourceUrls, url];
      this._newUrl = "";
    }
  }

  private _handleRemoveUrl(e: Event) {
    const button = (e.target as HTMLElement).closest("button");
    const urlToRemove = button?.dataset.url;
    if (urlToRemove) {
      this._sourceUrls = this._sourceUrls.filter((u) => u !== urlToRemove);
    }
  }

  private _handleUrlKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      this._handleAddUrl();
    }
  }

  reset() {
    this._theme = "";
    this._premise = "";
    this._sourceText = "";
    this._sourceUrls = [];
    this._newUrl = "";
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
        ${!this.isFree
          ? html`
              <div class="field">
                <label class="source-label">${msg("Source text")}</label>
                <textarea
                  .value=${live(this._sourceText)}
                  @input=${this._handleSourceTextInput}
                  placeholder=${msg("Source text (optional)")}
                  aria-label=${msg("Source text")}
                  rows="4"
                ></textarea>
              </div>
              <div class="field">
                <label class="source-label">${msg("Source URLs")}</label>
                <div class="url-input-row">
                  <input
                    type="url"
                    .value=${live(this._newUrl)}
                    @input=${this._handleNewUrlInput}
                    @keydown=${this._handleUrlKeyDown}
                    placeholder=${msg("Add URL")}
                    aria-label=${msg("Source URL")}
                  />
                  <button
                    type="button"
                    class="btn btn-primary"
                    aria-label=${msg("Add URL")}
                    @click=${this._handleAddUrl}
                    ?disabled=${!this._newUrl.trim()}
                  >
                    <ui-icon-add></ui-icon-add>
                  </button>
                </div>
                ${this._sourceUrls.length > 0
                  ? html`
                      <ul class="url-list">
                        ${this._sourceUrls.map(
                          (url) => html`
                            <li class="url-item">
                              <span class="url-text">${url}</span>
                              <button
                                type="button"
                                class="delete-button"
                                data-url=${url}
                                @click=${this._handleRemoveUrl}
                                aria-label=${msg("Remove URL")}
                              >
                                <ui-icon-delete></ui-icon-delete>
                              </button>
                            </li>
                          `,
                        )}
                      </ul>
                    `
                  : ""}
              </div>
            `
          : ""}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
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
      .source-label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--color-fg-muted);
      }
      .url-input-row {
        display: flex;
        gap: 8px;
      }
      .url-input-row input {
        flex: 1;
        min-width: 0;
      }
      .url-list {
        margin: 8px 0 0 0;
        padding: 0;
        list-style: none;
      }
      .url-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background: var(--color-bg-subtle);
        border-radius: 4px;
        margin-bottom: 4px;
      }
      .url-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
      }
      .delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--color-danger-fg);
        padding: 4px;
        opacity: 0.6;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      .delete-button:hover {
        opacity: 1;
      }
    `,
  ];
}
