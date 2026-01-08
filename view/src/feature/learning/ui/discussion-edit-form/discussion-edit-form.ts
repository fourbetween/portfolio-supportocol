import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import {
  DiscussionFormCloseEvent,
  DiscussionUpdateEvent,
} from "../../event/discussion";

@customElement("learning-discussion-edit-form")
export class LearningDiscussionEditForm extends LitElement {
  @property({ type: String })
  theme = "";

  @property({ type: String })
  status: "private" | "public" = "private";

  @query(".theme-input")
  private inputElement?: HTMLInputElement;

  @query(".status-select")
  private selectElement?: HTMLSelectElement;

  private handleSave() {
    this.dispatchEvent(
      new DiscussionUpdateEvent(
        this.inputElement?.value ?? "",
        (this.selectElement?.value as "private" | "public") ?? "private"
      )
    );
  }

  private handleCancel() {
    this.dispatchEvent(new DiscussionFormCloseEvent());
  }

  render() {
    return html`
      <div class="edit-form">
        <div class="field">
          <label for="theme" class="sr-only">Theme</label>
          <input
            id="theme"
            type="text"
            class="theme-input"
            .value=${this.theme}
            placeholder="Enter discussion theme"
          />
        </div>
        <div class="field status-field">
          <label for="status">Status</label>
          <select id="status" class="status-select">
            <option value="private" ?selected=${this.status === "private"}>
              Private
            </option>
            <option value="public" ?selected=${this.status === "public"}>
              Public
            </option>
          </select>
        </div>
        <div class="actions">
          <button
            class="btn btn-primary"
            @click=${this.handleSave}
            title="Save"
          >
            <span class="material-symbols-outlined">save</span>
          </button>
          <button class="btn" @click=${this.handleCancel} title="Cancel">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    iconStyle,
    css`
      :host {
        display: block;
        width: 100%;
      }

      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background-color: var(--color-canvas-default);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .status-field {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }

      .status-field label {
        font-size: 14px;
        color: var(--color-fg-muted);
      }

      .theme-input {
        width: 100%;
      }

      .status-select {
        padding: 4px 12px;
        font-size: 14px;
        color: var(--color-fg-default);
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        outline: none;
      }

      .status-select:focus {
        border-color: var(--color-accent-fg);
        box-shadow: inset 0 0 0 1px var(--color-accent-fg);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `,
  ];
}
