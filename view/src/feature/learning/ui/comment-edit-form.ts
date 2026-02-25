import { msg } from "@lit/localize";
import { LitElement, type PropertyValues, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { formStyle } from "../../../shared/style/form";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-save";
import {
  LearningCommentCreateEvent,
  LearningCommentFormCloseEvent,
  LearningCommentTypeSelectEvent,
  LearningCommentUpdateEvent,
} from "../event/comment";
import "./comment-type-popup";
import type { LearningCommentTypePopup } from "./comment-type-popup";

const MAX_CONTENT_LENGTH = 400;

@customElement("learning-comment-edit-form")
export class LearningCommentEditForm extends LitElement {
  @property({ type: String })
  commentId?: string;

  @property({ type: String })
  parentCommentId?: string | null;

  @property({ type: String })
  initialType = "";

  @property({ type: String })
  initialContent = "";

  @property({ type: Array })
  availableTypes: string[] = [];

  @state()
  private _commentType = "";

  @state()
  private _content = "";

  @query("learning-comment-type-popup")
  private popup!: LearningCommentTypePopup;

  @query("textarea")
  private textarea!: HTMLTextAreaElement;

  willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("initialType")) {
      this._commentType = this.initialType;
    }
    if (changedProperties.has("initialContent")) {
      this._content = this.initialContent;
    }
  }

  protected firstUpdated() {
    this.scrollIntoView({ behavior: "smooth", block: "nearest" });
    this.textarea?.focus();
  }

  private handleBadgeClick() {
    this.popup.open();
  }

  private handleTypeSelect(e: LearningCommentTypeSelectEvent) {
    this._commentType = e.commentType;
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this._content = target.value;
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
    const { _commentType: type, _content: content } = this;
    if (this.commentId) {
      this.dispatchEvent(
        new LearningCommentUpdateEvent(this.commentId, type, content),
      );
    } else {
      this.dispatchEvent(
        new LearningCommentCreateEvent(
          this.parentCommentId ?? null,
          type,
          content,
        ),
      );
    }
  }

  private handleCancel() {
    this.dispatchEvent(new LearningCommentFormCloseEvent());
  }

  private get _isContentOverLimit() {
    return this._content.length > MAX_CONTENT_LENGTH;
  }

  private renderHeader() {
    return html`
      <div class="header">
        <ui-comment-type-badge
          .type=${this._commentType}
          @click=${this.handleBadgeClick}
          class="type-badge"
        ></ui-comment-type-badge>
        <learning-comment-type-popup
          .types=${this.availableTypes}
          @learning-comment-type-select=${this.handleTypeSelect}
        ></learning-comment-type-popup>
      </div>
    `;
  }

  private renderContentField() {
    return html`
      <div class="content-field">
        <label for="content-textarea" class="sr-only">
          ${msg("Comment content")}
        </label>
        <textarea
          id="content-textarea"
          .value=${this._content}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
          placeholder=${msg("Enter your comment...")}
          maxlength=${MAX_CONTENT_LENGTH}
        ></textarea>
        <div class="char-counter ${this._isContentOverLimit ? "error" : ""}">
          ${this._content.length} / ${MAX_CONTENT_LENGTH}
        </div>
      </div>
    `;
  }

  private renderActions() {
    return html`
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
    `;
  }

  render() {
    return html`
      ${this.renderHeader()} ${this.renderContentField()}
      ${this.renderActions()}
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    formStyle,
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
      .char-counter {
        font-size: 0.8rem;
        color: var(--color-text-secondary, #666);
        text-align: right;
        margin-top: 4px;
      }
      .char-counter.error {
        color: var(--color-error, #d32f2f);
      }
    `,
  ];
}
