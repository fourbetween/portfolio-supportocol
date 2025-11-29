import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { Note } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { formStyle } from "../../../style/form";

@customElement("notes-panel-presenter")
export class NotesPanelPresenter extends LitElement {
  @property({ attribute: false })
  notes: Note[] = [];

  @property({ attribute: false })
  onCreateNote?: (content: string) => void;

  @query("#note-content")
  private contentTextarea!: HTMLTextAreaElement;

  render() {
    return html`
      <aside class="notes-panel">
        <h2>ノート</h2>
        <div class="note-form">
          <textarea
            id="note-content"
            placeholder="ノートを入力"
            rows="3"
          ></textarea>
          <button class="btn-primary" @click=${this.handleCreate}>追加</button>
        </div>
        ${this.notes.length === 0
          ? html`
              <p class="empty-message">ノートがありません</p>
            `
          : html`
              <ul class="notes-list">
                ${this.notes.map(
                  (note) => html`
                    <li class="note-item">
                      <p class="note-content">${note.content}</p>
                    </li>
                  `
                )}
              </ul>
            `}
      </aside>
    `;
  }

  private handleCreate() {
    const content = this.contentTextarea.value.trim();
    if (!content) {
      return;
    }
    this.onCreateNote?.(content);
    this.contentTextarea.value = "";
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    css`
      .notes-panel {
        padding: 16px;
        background-color: var(--color-canvas-subtle);
        border-left: 1px solid var(--color-border-default);
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      h2 {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 0 0 16px 0;
      }

      .note-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .note-form textarea {
        width: 100%;
        min-height: 60px;
        resize: vertical;
      }

      .note-form .btn-primary {
        align-self: flex-end;
      }

      .notes-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;
        flex: 1;
      }

      .note-item {
        padding: 12px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .note-content {
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .empty-message {
        padding: 16px;
        text-align: center;
        color: var(--color-fg-muted);
        font-size: 14px;
      }
    `,
  ];
}
