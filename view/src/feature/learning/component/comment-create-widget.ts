import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  LearningCommentCreateEvent,
  LearningCommentCreatedEvent,
  LearningCommentTypeSelectEvent,
} from "../event/comment";
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

  @state()
  private availableTypes: string[] = [];

  @query("learning-comment-type-popup")
  private popup!: LearningCommentTypePopup;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.availableTypes = deriveCommentFrame(this.comments || []).types;
    }
  }

  private handleStartCreate() {
    this.popup.open();
  }

  private handleTypeSelect(e: LearningCommentTypeSelectEvent) {
    this.selectedType = e.commentType;
    this.isCreating = true;
  }

  private async handleSave(e: LearningCommentCreateEvent) {
    if (!this.discussionId) return;

    try {
      const data = await commentRepository.create(this.discussionId, {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
        content: e.content,
      });

      showToast(this, "Comment created.", "success", 2000);
      this.handleCancel();
      if (data) {
        this.dispatchEvent(new LearningCommentCreatedEvent(data));
      }
    } catch (e: any) {
      showToast(this, e.message, "error");
    }
  }

  private handleCancel() {
    this.isCreating = false;
    this.selectedType = undefined;
  }

  private renderContent() {
    if (this.isCreating && this.selectedType) {
      return html`
        <learning-comment-edit-form
          .availableTypes=${this.availableTypes}
          .initialType=${this.selectedType}
          .parentCommentId=${this.parentCommentId}
          @learning-comment-create=${this.handleSave}
          @learning-comment-form-close=${this.handleCancel}
        ></learning-comment-edit-form>
      `;
    }

    return html`
      <learning-comment-add-button
        .isReply=${!!this.parentCommentId}
        @click=${this.handleStartCreate}
      ></learning-comment-add-button>
    `;
  }

  render() {
    if (!this.discussionId) return nothing;

    return html`
      <div class="container">
        ${this.renderContent()}
        <learning-comment-type-popup
          .types=${this.availableTypes}
          @learning-comment-type-select=${this.handleTypeSelect}
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
