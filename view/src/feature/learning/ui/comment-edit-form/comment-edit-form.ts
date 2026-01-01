import { LitElement, type PropertyValues, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import "../comment-type-badge/comment-type-badge";
import "../comment-type-popup/comment-type-popup";
import type { LearningCommentTypePopup } from "../comment-type-popup/comment-type-popup";

@customElement("learning-comment-edit-form")
export class LearningCommentEditForm extends LitElement {
  @property({ type: String })
  initialType = "";

  @property({ type: String })
  initialContent = "";

  @property({ type: Array })
  availableTypes: string[] = [];

  @property({ attribute: false })
  onSave?: (detail: { commentType: string; content: string }) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  @state()
  private _commentType = "";

  @state()
  private _content = "";

  @query("learning-comment-type-popup")
  private popup!: LearningCommentTypePopup;

  willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("initialType")) {
      this._commentType = this.initialType;
    }
    if (changedProperties.has("initialContent")) {
      this._content = this.initialContent;
    }
  }

  render() {
    return html`
      <div class="header">
        <learning-comment-type-badge
          .type=${this._commentType}
          @click=${this.handleBadgeClick}
          class="type-badge"
        ></learning-comment-type-badge>
        <learning-comment-type-popup
          .types=${this.availableTypes}
          .onSelect=${this.handleTypeSelect}
        ></learning-comment-type-popup>
      </div>
      <div class="content-field">
        <label for="content-textarea" class="sr-only">Comment content</label>
        <textarea
          id="content-textarea"
          .value=${this._content}
          @input=${this.handleInput}
          placeholder="Enter your comment..."
        ></textarea>
      </div>
      <div class="actions">
        <button
          class="btn btn-primary save-button"
          @click=${this.handleSave}
          title="Save"
        >
          <span class="material-symbols-outlined">save</span>
        </button>
        <button
          class="btn cancel-button"
          @click=${this.handleCancel}
          title="Cancel"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    `;
  }

  private handleBadgeClick() {
    this.popup.open();
  }

  private handleTypeSelect = (type: string) => {
    this._commentType = type;
  };

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this._content = target.value;
  }

  private handleSave() {
    this.onSave?.({
      commentType: this._commentType,
      content: this._content,
    });
  }

  private handleCancel() {
    this.onCancel?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    iconStyle,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 8px;
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
      .content-field {
        display: flex;
        flex-direction: column;
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
      .sr-only {
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
    `,
  ];
}
