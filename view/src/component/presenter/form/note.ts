import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("note-form-presenter")
export class NoteFormPresenter extends LitElement {
  render() {
    return html`
      <div class="note-form-container">
        <div class="note-form-content">
          <label class="visually-hidden" for="note-input">
            Jot down an idea...
          </label>
          <textarea
            class="note-textarea"
            id="note-input"
            placeholder="Jot down an idea..."
            rows="3"
          ></textarea>
          <button class="note-submit-button">Add Note</button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .note-form-container {
        padding: 1rem;
        border-bottom: 1px solid #d0d7de;
      }

      .note-form-content {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .visually-hidden {
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

      .note-textarea {
        width: 100%;
        resize: none;
        border-radius: 0.5rem;
        color: #333333;
        background: #ffffff;
        border: 1px solid #d0d7de;
        padding: 0.5rem;
        font-size: 0.875rem;
        min-height: 80px;
        font-family: inherit;
      }

      .note-textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px #1976d2;
        border-color: #1976d2;
      }

      .note-textarea::placeholder {
        color: #757575;
      }

      .note-submit-button {
        display: flex;
        width: 100%;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        border-radius: 0.5rem;
        height: 2.25rem;
        padding: 0 0.75rem;
        background: #2e7d32;
        color: white;
        font-size: 0.875rem;
        font-weight: 600;
        line-height: normal;
        border: none;
        transition: background 0.2s ease;
      }

      .note-submit-button:hover {
        background: #1b5e20;
      }

      .note-submit-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ];
}
