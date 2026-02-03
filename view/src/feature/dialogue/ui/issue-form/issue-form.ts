import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import {
  DialogueIssueCreateCancelEvent,
  DialogueIssueCreateEvent,
} from "../../event/issue";

@customElement("dialogue-issue-form")
export class DialogueIssueForm extends LitElement {
  @query("#title")
  private _titleInput!: HTMLInputElement;

  @query("#description")
  private _descriptionInput!: HTMLTextAreaElement;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const title = this._titleInput.value.trim();
    const description = this._descriptionInput.value.trim();

    if (title) {
      this.dispatchEvent(new DialogueIssueCreateEvent(title, description));
    }
  }

  private _handleCancel() {
    this.dispatchEvent(new DialogueIssueCreateCancelEvent());
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <div class="field">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            class="input"
            required
            placeholder="Type issue title..."
          />
        </div>
        <div class="field">
          <label for="description">Description (Optional)</label>
          <textarea
            id="description"
            class="textarea"
            placeholder="Type issue description..."
          ></textarea>
        </div>
        <div class="actions">
          <button type="button" class="btn" @click=${this._handleCancel}>
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">Add Issue</button>
        </div>
      </form>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      :host {
        display: block;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      label {
        font-weight: bold;
        font-size: 0.9rem;
      }
      .input,
      .textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--color-border);
        border-radius: 4px;
        font-family: inherit;
        font-size: 1rem;
        box-sizing: border-box;
      }
      .textarea {
        min-height: 100px;
        resize: vertical;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];
}
