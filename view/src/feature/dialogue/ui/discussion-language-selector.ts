import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { DialogueDiscussionLanguageChangeEvent } from "../event/discussion";
import type { DiscussionLanguage } from "../model/discussion";

@customElement("dialogue-discussion-language-selector")
export class DialogueDiscussionLanguageSelector extends LitElement {
  @property({ type: String })
  language: DiscussionLanguage | undefined = undefined;

  private handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const value = select.value;
    const language = value === "" ? undefined : (value as DiscussionLanguage);
    this.dispatchEvent(new DialogueDiscussionLanguageChangeEvent(language));
  }

  render() {
    return html`
      <div class="container">
        <label for="language-select">${msg("Language")}</label>
        <select
          id="language-select"
          .value=${this.language ?? ""}
          @change=${this.handleChange}
        >
          <option value="">${msg("All")}</option>
          <option value="en">${msg("English")}</option>
          <option value="ja">${msg("Japanese")}</option>
        </select>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--color-fg-muted);
      }

      select {
        padding: 4px 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
        font-size: 14px;
        cursor: pointer;
      }

      select:focus {
        outline: none;
        border-color: var(--color-accent-fg);
      }
    `,
  ];
}
