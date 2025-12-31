import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { inputStyle } from "../../../../shared/style/input";
import "../comment-type-badge/comment-type-badge";
import "../comment-type-popup/comment-type-popup";
import type { LearningCommentTypePopup } from "../comment-type-popup/comment-type-popup";

@customElement("learning-comment-edit-form")
export class LearningCommentEditForm extends LitElement {
  @property({ type: String })
  commentType = "";

  @property({ type: String })
  content = "";

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ attribute: false })
  onSave?: (detail: { commentType: string; content: string }) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  @query("learning-comment-type-popup")
  private popup!: LearningCommentTypePopup;

  render() {
    return html`
      <div class="header">
        <learning-comment-type-badge
          .type=${this.commentType}
          @click=${this.handleBadgeClick}
          class="type-badge"
        ></learning-comment-type-badge>
        <learning-comment-type-popup
          .types=${this.availableTypes}
          .onSelect=${this.handleTypeSelect}
        ></learning-comment-type-popup>
      </div>
      <textarea
        .value=${this.content}
        @input=${this.handleInput}
        aria-label="Comment content"
        placeholder="Enter your comment..."
      ></textarea>
      <div class="actions">
        <button class="btn cancel-button" @click=${this.handleCancel}>
          Cancel
        </button>
        <button class="btn btn-primary save-button" @click=${this.handleSave}>
          Save
        </button>
      </div>
    `;
  }

  private handleBadgeClick() {
    this.popup.open();
  }

  private handleTypeSelect = (type: string) => {
    this.commentType = type;
  };

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.content = target.value;
  }

  private handleSave() {
    this.onSave?.({
      commentType: this.commentType,
      content: this.content,
    });
  }

  private handleCancel() {
    this.onCancel?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }
      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
      }
      .type-badge {
        cursor: pointer;
      }
      textarea {
        width: 100%;
        min-height: 120px;
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
