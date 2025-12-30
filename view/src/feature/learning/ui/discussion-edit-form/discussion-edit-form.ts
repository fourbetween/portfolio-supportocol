import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { inputStyle } from "../../../../shared/style/input";

@customElement("learning-discussion-edit-form")
export class LearningDiscussionEditForm extends LitElement {
  @property({ type: String })
  theme = "";

  @property({ attribute: false })
  onSave?: (theme: string) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  @query("input")
  private inputElement?: HTMLInputElement;

  render() {
    return html`
      <div class="edit-form">
        <input
          type="text"
          class="theme-input"
          .value=${this.theme}
          placeholder="Enter discussion theme"
        />
        <div class="actions">
          <button
            class="btn btn-primary"
            @click=${() => this.onSave?.(this.inputElement?.value ?? "")}
          >
            Save
          </button>
          <button class="btn" @click=${() => this.onCancel?.()}>Cancel</button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    css`
      .edit-form {
        width: 100%;
      }

      .theme-input {
        width: 100%;
        font-size: 32px;
        font-weight: 600;
        padding: 8px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-subtle);
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    `,
  ];
}
