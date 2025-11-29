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

  @property({ attribute: false })
  onDeleteNote?: (noteId: string) => void;

  @property({ attribute: false })
  onConvertToComment?: (note: Note) => void;

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
                      <div class="note-actions">
                        <button
                          class="btn-convert"
                          @click=${() => this.onConvertToComment?.(note)}
                        >
                          コメントに変換
                        </button>
                        <button
                          class="btn-delete"
                          @click=${() => this.onDeleteNote?.(note.id)}
                        >
                          削除
                        </button>
                      </div>
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
      :host {
        display: block;
      }

      .notes-panel {
        padding: 16px;
        background-color: var(--color-canvas-subtle);
        border-left: 1px solid var(--color-border-default);
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
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

      .note-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
      }

      .btn-convert {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-accent-fg);
        background-color: transparent;
        border: 1px solid var(--color-accent-muted);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-convert:hover {
        background-color: var(--color-accent-subtle);
        border-color: var(--color-accent-fg);
      }

      .btn-delete {
        padding: 4px 8px;
        font-size: 12px;
        font-weight: 500;
        color: var(--color-danger-fg);
        background-color: transparent;
        border: 1px solid var(--color-danger-muted);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-delete:hover {
        background-color: var(--color-danger-subtle);
        border-color: var(--color-danger-fg);
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
