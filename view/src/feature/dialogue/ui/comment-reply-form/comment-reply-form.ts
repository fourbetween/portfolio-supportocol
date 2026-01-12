import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import {
  DialogueCommentCreateCancelEvent,
  DialogueCommentCreateEvent,
} from "../../event/comment";
import type { CommentFrame } from "../../model/comment-frame";

@customElement("dialogue-comment-reply-form")
export class DialogueCommentReplyForm extends LitElement {
  @property({ type: String })
  parentCommentId: string | null = null;

  @property({ type: Object })
  frame?: CommentFrame;

  @state()
  private selectedType = "";

  @state()
  private replyContent = "";

  connectedCallback() {
    super.connectedCallback();
    if (this.frame?.types.length) {
      this.selectedType = this.frame.types[0];
    }
  }

  private handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.selectedType = target.value;
  }

  private handleContentInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.replyContent = target.value;
  }

  private handleSave() {
    if (this.selectedType && this.replyContent) {
      this.dispatchEvent(
        new DialogueCommentCreateEvent(
          this.parentCommentId,
          this.selectedType,
          this.replyContent
        )
      );
    }
  }

  private handleCancel() {
    this.dispatchEvent(new DialogueCommentCreateCancelEvent());
  }

  render() {
    return html`
      <div class="reply-form">
        <select .value=${this.selectedType} @change=${this.handleTypeChange}>
          ${this.frame?.types.map(
            (type) =>
              html`
                <option value=${type} ?selected=${this.selectedType === type}>
                  ${type}
                </option>
              `
          )}
        </select>
        <textarea
          placeholder="Enter your reply..."
          .value=${this.replyContent}
          @input=${this.handleContentInput}
        ></textarea>
        <div class="actions">
          <button
            class="btn cancel-button"
            @click=${this.handleCancel}
            title="Cancel"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          <button
            class="btn btn-primary save-button"
            @click=${this.handleSave}
            title="Save"
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
    iconStyle,
    css`
      :host {
        display: block;
      }
      .reply-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply-form select {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        font-size: 14px;
      }
      .reply-form textarea {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        min-height: 80px;
        resize: vertical;
        font-size: 14px;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];
}
