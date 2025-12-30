import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import type { Discussion } from "../../model/discussion";
import "../discussion-edit-form/discussion-edit-form";

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

  render() {
    return html`
      <div class="container">
        <div class="header">
          ${this.isEditing
            ? html`
                <learning-discussion-edit-form
                  .theme=${this.discussion?.theme ?? ""}
                  .onSave=${(theme: string) => this.onSave?.(theme)}
                  .onCancel=${() => this.onCancel?.()}
                ></learning-discussion-edit-form>
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
    css`
      learning-discussion-edit-form {
        width: 100%;
      }

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

      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
