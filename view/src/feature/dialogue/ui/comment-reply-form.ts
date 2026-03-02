import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-save";
import {
  DialogueCommentCreateCancelEvent,
  DialogueCommentCreateEvent,
} from "../event/comment";
import type { CommentFrame } from "../model/comment-frame";

@customElement("dialogue-comment-reply-form")
export class DialogueCommentReplyForm extends LitElement {
  @property({ type: String })
  parentCommentId: string | null = null;

  @property({ type: Object })
  frame?: CommentFrame;

  @property({ type: String })
  parentCommentType = "";

  @state()
  private selectedType = "";

  @state()
  private replyContent = "";

  @query("textarea")
  private textarea!: HTMLTextAreaElement;

  private get allowedTypes() {
    if (!this.frame) return [];
    return this.frame.paths
      .filter((p) => p.parent === this.parentCommentType)
      .map((p) => p.child);
  }

  connectedCallback() {
    super.connectedCallback();
    const types = this.allowedTypes;
    if (types.length) {
      this.selectedType = types[0];
    }
  }

  protected firstUpdated() {
    this.scrollIntoView({ behavior: "smooth", block: "nearest" });
    this.textarea?.focus();
  }

  private handleTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.selectedType = target.value;
  }

  private handleContentInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.replyContent = target.value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.handleCancel();
    } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      this.handleSave();
    }
  }

  private handleSave() {
    if (this.selectedType && this.replyContent) {
      this.dispatchEvent(
        new DialogueCommentCreateEvent(
          this.parentCommentId,
          this.selectedType,
          this.replyContent,
        ),
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
          ${this.allowedTypes.map(
            (type) => html`
              <option value=${type} ?selected=${this.selectedType === type}>
                ${type}
              </option>
            `,
          )}
        </select>
        <textarea
          placeholder=${msg("Enter your reply...")}
          .value=${this.replyContent}
          @input=${this.handleContentInput}
          @keydown=${this.handleKeyDown}
        ></textarea>
        <div class="actions">
          <button
            class="btn cancel-button"
            @click=${this.handleCancel}
            title=${msg("Cancel")}
          >
            <ui-icon-close></ui-icon-close>
          </button>
          <button
            class="btn btn-primary save-button"
            @click=${this.handleSave}
            title=${msg("Save")}
          >
            <ui-icon-save></ui-icon-save>
          </button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    css`
      .reply-form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .reply-form textarea {
        min-height: 80px;
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
