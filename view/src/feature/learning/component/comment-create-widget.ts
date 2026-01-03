import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import { commentRepository } from "../repository/comment-repository";
import "../ui/comment-add-button/comment-add-button";
import "../ui/comment-edit-form/comment-edit-form";
import "../ui/comment-type-popup/comment-type-popup";
import type { LearningCommentTypePopup } from "../ui/comment-type-popup/comment-type-popup";

@customElement("learning-comment-create-widget")
export class LearningCommentCreateWidget extends LitElement {
  @property({ type: String })
  discussionId?: string;

  @property({ type: String })
  parentCommentId?: string;

  @property({ type: Array })
  comments?: Comment[] = [];

  @state()
  private isCreating = false;

  @state()
  private selectedType?: string;

  @query("learning-comment-type-popup")
  private popup!: LearningCommentTypePopup;

  private availableTypes: string[] = [];

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.availableTypes = [];
      this.availableTypes = deriveCommentFrame(this.comments || []).types;
    }
  }

  private handleStartCreate() {
    this.popup.open();
  }

  private handleTypeSelect(type: string) {
    this.selectedType = type;
    this.isCreating = true;
  }

  private async handleSave(detail: { commentType: string; content: string }) {
    if (!this.discussionId) return;

    try {
      const data = await commentRepository.create(this.discussionId, {
        parentCommentId: this.parentCommentId || null,
        commentType: detail.commentType,
        content: detail.content,
      });

      showToast(this, "Comment created.", "success", 2000);
      this.handleCancel();
      this.dispatchEvent(
        new CustomEvent("comment-created", {
          detail: data,
          bubbles: true,
          composed: true,
        })
      );
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  private handleCancel() {
    this.isCreating = false;
    this.selectedType = undefined;
  }

  render() {
    if (!this.discussionId) return nothing;

    return html`
      <div class="container">
        ${this.isCreating && this.selectedType
          ? html`
              <learning-comment-edit-form
                .availableTypes=${this.availableTypes}
                .initialType=${this.selectedType}
                .onSave=${(detail: { commentType: string; content: string }) =>
                  this.handleSave(detail)}
                .onCancel=${() => this.handleCancel()}
              ></learning-comment-edit-form>
            `
          : html`
              <learning-comment-add-button
                .isReply=${!!this.parentCommentId}
                @click=${this.handleStartCreate}
              ></learning-comment-add-button>
            `}
        <learning-comment-type-popup
          .types=${this.availableTypes}
          .onSelect=${(type: string) => this.handleTypeSelect(type)}
        ></learning-comment-type-popup>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }
      .container {
        padding: 8px 0;
      }
    `,
  ];
}
