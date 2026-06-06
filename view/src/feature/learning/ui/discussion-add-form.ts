import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { getLocale } from "../../../localization";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/icons/icon-add";
import "../../../shared/ui/icons/icon-delete";
import type { CommentFrame } from "../model/comment-frame";
import type { DiscussionLanguage, ModelLevel } from "../model/discussion";
import "./comment-frame-form";
import type { LearningCommentFrameForm } from "./comment-frame-form";

@customElement("learning-discussion-add-form")
export class LearningDiscussionAddForm extends LitElement {
  @property({ type: Boolean })
  isFree = false;

  @state()
  private _theme = "";

  @state()
  private _language: DiscussionLanguage = getLocale() === "ja" ? "ja" : "en";

  @state()
  private _sourceMode: "text" | "urls" = "text";

  @state()
  private _sourceText = "";

  @state()
  private _sourceUrls: string[] = [];

  @state()
  private _newUrl = "";

  @state()
  private _modelLevel: ModelLevel = "medium";

  @query("learning-comment-frame-form")
  private _commentFrameForm!: LearningCommentFrameForm;

  get value(): {
    theme: string;
    language: DiscussionLanguage;
    sourceText?: string;
    sourceUrls?: string[];
    modelLevel?: ModelLevel;
    commentFrame: CommentFrame;
  } {
    const hasSource =
      this._sourceText.trim().length > 0 || this._sourceUrls.length > 0;
    return {
      theme: this._theme,
      language: this._language,
      commentFrame: this._commentFrameForm?.value ?? { types: [], paths: [] },
      ...(hasSource
        ? {
            sourceText: this._sourceText,
            sourceUrls: this._sourceUrls,
            modelLevel: this._modelLevel,
          }
        : {}),
    };
  }

  get isValid(): boolean {
    const hasSource =
      this._sourceText.trim().length > 0 || this._sourceUrls.length > 0;
    return this._theme.trim().length > 0 || hasSource;
  }

  private get _hasSource(): boolean {
    return this._sourceText.trim().length > 0 || this._sourceUrls.length > 0;
  }

  private _handleThemeInput(e: InputEvent) {
    const input = e.target as HTMLInputElement;
    this._theme = input.value;
  }

  private _handleSourceModeChange(mode: "text" | "urls") {
    this._sourceMode = mode;
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
    if (url && !this._sourceUrls.includes(url) && this._sourceUrls.length < 3) {
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

  private _handleModelLevelChange(e: InputEvent) {
    const select = e.target as HTMLSelectElement;
    this._modelLevel = select.value as ModelLevel;
  }

  reset() {
    this._theme = "";
    this._sourceMode = "text";
    this._sourceText = "";
    this._sourceUrls = [];
    this._newUrl = "";
    this._modelLevel = "medium";
    if (this._commentFrameForm) {
      this._commentFrameForm.initialFrame = null;
    }
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

        ${!this.isFree
          ? html`
              <div class="field">
                <div class="source-tabs">
                  <button
                    type="button"
                    class="source-tab ${this._sourceMode === "text"
                      ? "active"
                      : ""}"
                    @click=${() => this._handleSourceModeChange("text")}
                  >
                    ${msg("Source text")}
                  </button>
                  <button
                    type="button"
                    class="source-tab ${this._sourceMode === "urls"
                      ? "active"
                      : ""}"
                    @click=${() => this._handleSourceModeChange("urls")}
                  >
                    ${msg("Source URLs")}
                  </button>
                </div>
                ${this._sourceMode === "text"
                  ? html`
                      <textarea
                        .value=${live(this._sourceText)}
                        @input=${this._handleSourceTextInput}
                        placeholder=${msg("Source text (optional)")}
                        aria-label=${msg("Source text")}
                        rows="4"
                      ></textarea>
                    `
                  : html`
                      <div class="url-input-row">
                        <input
                          type="url"
                          .value=${live(this._newUrl)}
                          @input=${this._handleNewUrlInput}
                          @keydown=${this._handleUrlKeyDown}
                          placeholder=${msg("Add URL")}
                          aria-label=${msg("Source URL")}
                          ?disabled=${this._sourceUrls.length >= 3}
                        />
                        <button
                          type="button"
                          class="btn btn-primary"
                          aria-label=${msg("Add URL")}
                          @click=${this._handleAddUrl}
                          ?disabled=${!this._newUrl.trim() || this._sourceUrls.length >= 3}
                        >
                          <ui-icon-add></ui-icon-add>
                        </button>
                      </div>
                      <div class="url-count">${this._sourceUrls.length} / 3</div>
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
                    `}
              </div>
            `
          : ""}
        ${!this.isFree && this._hasSource
          ? html`
              <div class="field">
                <label class="field-label">${msg("AI Model")}</label>
                <select
                  .value=${live(this._modelLevel)}
                  @input=${this._handleModelLevelChange}
                  aria-label=${msg("AI Model")}
                >
                  <option value="low">${msg("Fast")}</option>
                  <option value="medium">${msg("Balanced")}</option>
                  <option value="high">${msg("High quality")}</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">${msg("Comment Frame")}</label>
                <learning-comment-frame-form></learning-comment-frame-form>
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
      .source-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
      }
      .source-tab {
        padding: 6px 12px;
        border: 1px solid var(--color-border);
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        color: var(--color-fg-muted);
        transition: all 0.2s;
      }
      .source-tab:hover {
        background: var(--color-bg-subtle);
      }
      .source-tab.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: var(--color-fg-on-primary);
      }
      .url-input-row {
        display: flex;
        gap: 8px;
      }
      .url-input-row input {
        flex: 1;
        min-width: 0;
      }
      .url-count {
        font-size: 12px;
        color: var(--color-fg-muted);
        text-align: right;
        margin-top: 4px;
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
      .field-label {
        display: block;
        font-size: 13px;
        color: var(--color-fg-muted);
        margin-bottom: 4px;
      }
    `,
  ];
}
