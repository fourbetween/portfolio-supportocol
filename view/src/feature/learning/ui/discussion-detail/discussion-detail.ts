import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import type { Discussion } from "../../model/discussion";

@customElement("learning-discussion-detail")
export class LearningDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Boolean })
  isEditing = false;

  @property({ attribute: false })
  onEdit?: () => void;

  @property({ attribute: false })
  onSave?: (theme: string) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  @query("input")
  private inputElement?: HTMLInputElement;

  render() {
    return html`
      <div class="container">
        <div class="header">
          ${this.isEditing
            ? html`
                <div class="edit-form">
                  <input
                    type="text"
                    class="theme-input"
                    .value=${this.discussion?.theme ?? ""}
                    placeholder="Enter discussion theme"
                  />
                  <div class="actions">
                    <button
                      class="btn btn-primary"
                      @click=${() =>
                        this.onSave?.(this.inputElement?.value ?? "")}
                    >
                      Save
                    </button>
                    <button class="btn" @click=${() => this.onCancel?.()}>
                      Cancel
                    </button>
                  </div>
                </div>
              `
            : html`
                <div class="display">
                  <h1 class="theme">${this.discussion?.theme}</h1>
                  <button class="btn" @click=${() => this.onEdit?.()}>
                    <span class="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    inputStyle,
    css`
      .container {
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
        background-color: var(--color-canvas-default);
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }

      .theme {
        font-size: 32px;
        font-weight: 600;
        margin: 0;
      }

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

      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
