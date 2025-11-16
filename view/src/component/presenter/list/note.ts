import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Note } from "../../../model/discussion";
import { baseStyle } from "../../../style/base";
import { iconStyle } from "../../../style/icon";

@customElement("note-list-presenter")
export class NoteListPresenter extends LitElement {
  @property({ type: Array })
  notes: Note[] = [];

  render() {
    return html`
      <div class="note-list">
        <p class="note-list-header">Drag a note to add it as a comment</p>
        ${this.notes.length === 0
          ? this.renderEmptyState()
          : this.notes.map((note) => this.renderNoteItem(note))}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <span class="material-symbols-outlined empty-icon">edit_note</span>
        <h4 class="empty-title">No notes yet</h4>
        <p class="empty-message">Create your first note to get started.</p>
      </div>
    `;
  }

  private renderNoteItem(note: Note) {
    return html`
      <div class="note-item">
        <div class="drag-handle">
          <span class="material-symbols-outlined">drag_indicator</span>
        </div>
        <p class="note-content">${note.content}</p>
        <div class="note-actions">
          <button class="note-action-button" aria-label="Note options">
            <span class="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .note-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        overflow-y: auto;
      }

      .note-list-header {
        font-size: 12px;
        color: var(--color-text-secondary, #57606a);
        padding: 0 8px 4px;
        margin: 0;
      }

      .note-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: var(--color-canvas-default, #ffffff);
        padding: 8px;
        border-radius: 6px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
        cursor: grab;
      }

      .note-item:hover {
        border-color: var(--color-border-default, #d0d7de);
      }

      .drag-handle {
        flex-shrink: 0;
        color: var(--color-text-secondary, #57606a);
        padding-top: 2px;
        cursor: grab;
      }

      .drag-handle .material-symbols-outlined {
        font-size: 16px;
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 20;
      }

      .note-content {
        flex: 1;
        margin: 0;
        font-size: 14px;
        line-height: 1.4;
        color: var(--color-text-primary, #1f2328);
        font-weight: 400;
      }

      .note-actions {
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .note-item:hover .note-actions {
        opacity: 1;
      }

      .note-action-button {
        padding: 4px;
        background: transparent;
        border: none;
        border-radius: 6px;
        color: var(--color-text-secondary, #57606a);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .note-action-button:hover {
        background: rgba(0, 0, 0, 0.1);
      }

      .note-action-button .material-symbols-outlined {
        font-size: 16px;
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 20;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 64px 16px;
      }

      .empty-icon {
        font-size: 48px;
        color: var(--color-text-secondary, #57606a);
        margin-bottom: 12px;
        font-variation-settings: "FILL" 0, "wght" 300, "GRAD" 0, "opsz" 48;
      }

      .empty-title {
        margin: 0 0 4px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary, #1f2328);
      }

      .empty-message {
        margin: 0;
        font-size: 14px;
        color: var(--color-text-secondary, #57606a);
      }
    `,
  ];
}
