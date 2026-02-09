import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import { inputStyle } from "../../../shared/style/input";
import {
  LearningDiscussionFormCloseEvent,
  LearningDiscussionUpdateEvent,
} from "../event/discussion";

@customElement("learning-discussion-edit-form")
export class LearningDiscussionEditForm extends LitElement {
  @property({ type: String })
  theme = "";

  @property({ type: String })
  premise = "";

  @property({ type: String })
  conclusion = "";

  @query(".theme-input")
  private inputElement?: HTMLInputElement;

  @query(".premise-input")
  private premiseElement?: HTMLTextAreaElement;

  @query(".conclusion-input")
  private conclusionElement?: HTMLTextAreaElement;

  private handleSave() {
    this.dispatchEvent(
      new LearningDiscussionUpdateEvent(
        this.inputElement?.value ?? "",
        this.premiseElement?.value ?? "",
        this.conclusionElement?.value ?? "",
      ),
    );
  }

  private handleCancel() {
    this.dispatchEvent(new LearningDiscussionFormCloseEvent());
  }

  render() {
    return html`
      <div class="edit-form">
        <div class="field">
          <input
            id="theme"
            type="text"
            class="theme-input"
            .value=${this.theme}
            placeholder=${msg("Enter discussion theme")}
          />
        </div>
        <div class="field">
          <textarea
            id="premise"
            class="premise-input"
            .value=${this.premise}
            placeholder=${msg("Enter discussion premise")}
            rows="3"
          ></textarea>
        </div>
        <div class="field">
          <textarea
            id="conclusion"
            class="conclusion-input"
            .value=${this.conclusion}
            placeholder=${msg("Enter discussion conclusion")}
            rows="3"
          ></textarea>
        </div>
        <div class="actions">
          <button
            class="btn"
            @click=${this.handleCancel}
            title=${msg("Cancel")}
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <button
            class="btn btn-primary"
            @click=${this.handleSave}
            title=${msg("Save")}
          >
            <span class="material-symbols-outlined">save</span>
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

      .field {
        flex-direction: row;
        align-items: flex-start;
        gap: 8px;
      }

      .field label {
        font-size: 14px;
        color: var(--color-fg-muted);
      }

      .theme-input,
      .premise-input,
      .conclusion-input {
        width: 100%;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }
    `,
  ];
}
