import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { discussionDetailStyle } from "../../../shared/style/discussion-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/collapsible-section/collapsible-section";
import "../../../shared/ui/discussion-archive-badge/discussion-archive-badge";
import "../../../shared/ui/icons/icon-archive";
import "../../../shared/ui/icons/icon-content-copy";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-edit";
import "../../../shared/ui/icons/icon-psychology";
import "../../../shared/ui/icons/icon-unarchive";
import "../../../shared/ui/markdown-viewer/markdown-viewer";
import {
  LearningDiscussionArchiveEvent,
  LearningDiscussionDeleteEvent,
  LearningDiscussionFormOpenEvent,
  LearningDiscussionUnarchiveEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import type { CommentFrame } from "../model/comment-frame";
import type { Discussion } from "../model/discussion";
import "./comment-frame-badge";
import "./comment-generate-popup";
import type { LearningCommentGeneratePopup } from "./comment-generate-popup";
import "./dialogue-settings-popup";
import type { LearningDialogueSettingsPopup } from "./dialogue-settings-popup";
import "./discussion-edit-form";
import "./discussion-markdown-popup";
import type { LearningDiscussionMarkdownPopup } from "./discussion-markdown-popup";
import "./discussion-status-badge";
import "./discussion-status-popup";
import type { DiscussionStatusPopup } from "./discussion-status-popup";

@customElement("learning-discussion-detail")
export class LearningDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @property({ type: Array })
  comments: Comment[] = [];

  @property({ type: Boolean })
  isEditing = false;

  @property({ type: Boolean })
  isFree = true;

  @query("learning-discussion-status-popup")
  private statusPopup!: DiscussionStatusPopup;

  @query("learning-dialogue-settings-popup")
  private dialogueSettingsPopup!: LearningDialogueSettingsPopup;

  @query("learning-discussion-markdown-popup")
  private markdownPopup!: LearningDiscussionMarkdownPopup;

  @query("learning-comment-generate-popup")
  private generatePopup!: LearningCommentGeneratePopup;

  render() {
    if (!this.discussion && !this.isEditing) {
      return html``;
    }

    return html`
      <div class="container">
        <div class="header">
          ${this.isEditing ? this._renderEditForm() : this._renderDisplay()}
        </div>
      </div>
      <learning-discussion-status-popup
        .status=${this.discussion?.status ?? "private"}
      ></learning-discussion-status-popup>
      <learning-dialogue-settings-popup
        .initialSettings=${this.discussion?.dialogueSettings}
        .usedFrame=${this.usedFrame}
      ></learning-dialogue-settings-popup>
      <learning-discussion-markdown-popup
        .discussion=${this.discussion}
        .comments=${this.comments}
      ></learning-discussion-markdown-popup>
      <learning-comment-generate-popup
        .initialFrame=${this.usedFrame}
        .usedFrame=${this.usedFrame}
      ></learning-comment-generate-popup>
    `;
  }

  private _renderEditForm() {
    return html`
      <learning-discussion-edit-form
        .theme=${this.discussion?.theme ?? ""}
        .premise=${this.discussion?.premise ?? ""}
        .conclusion=${this.discussion?.conclusion ?? ""}
        .language=${this.discussion?.language ?? "ja"}
      ></learning-discussion-edit-form>
    `;
  }

  private _renderDisplay() {
    return html`
      <div class="display">
        <div class="badge-row">
          <div class="status-group">
            <learning-discussion-status-badge
              .status=${this.discussion?.status}
              class="clickable"
              @click=${this._handleBadgeClick}
            ></learning-discussion-status-badge>
            ${this.discussion?.status === "public"
              ? html`
                  <learning-comment-frame-badge
                    @click=${this._handleCommentFrameBadgeClick}
                  ></learning-comment-frame-badge>
                `
              : html``}
            <ui-discussion-archive-badge
              .archived=${!!this.discussion?.archivedAt}
            ></ui-discussion-archive-badge>
          </div>
          <div class="actions">
            ${!this.isFree
              ? html`
                  <button class="btn" @click=${this._handleGenerateClick}>
                    <ui-icon-psychology></ui-icon-psychology>
                  </button>
                `
              : html``}
            <button class="btn danger" @click=${this._handleDeleteClick}>
              <ui-icon-delete></ui-icon-delete>
            </button>
            <button class="btn" @click=${this._handleMarkdownClick}>
              <ui-icon-content-copy></ui-icon-content-copy>
            </button>
            ${this.discussion?.archivedAt
              ? html`
                  <button class="btn" @click=${this._handleUnarchiveClick}>
                    <ui-icon-unarchive></ui-icon-unarchive>
                  </button>
                `
              : html`
                  <button class="btn" @click=${this._handleArchiveClick}>
                    <ui-icon-archive></ui-icon-archive>
                  </button>
                `}
            <button class="btn" @click=${this._handleEditClick}>
              <ui-icon-edit></ui-icon-edit>
            </button>
          </div>
        </div>
        <div class="theme-row">
          <div class="section-title">${msg("Theme")}</div>
          <h1 class="theme">${this.discussion?.theme}</h1>
        </div>
        ${this.discussion?.premise
          ? html`
              <div class="premise-row">
                <div class="section-title">${msg("Premise")}</div>
                <ui-collapsible-section>
                  <ui-markdown-viewer
                    .content=${this.discussion.premise}
                  ></ui-markdown-viewer>
                </ui-collapsible-section>
              </div>
            `
          : html``}
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">${msg("Conclusion")}</div>
                <ui-collapsible-section>
                  <ui-markdown-viewer
                    .content=${this.discussion.conclusion}
                  ></ui-markdown-viewer>
                </ui-collapsible-section>
              </div>
            `
          : html``}
      </div>
    `;
  }

  private _handleBadgeClick() {
    this.statusPopup.open = true;
  }

  private _handleCommentFrameBadgeClick() {
    this.dialogueSettingsPopup.open = true;
  }

  private _handleArchiveClick() {
    if (!this.discussion) return;
    this.dispatchEvent(new LearningDiscussionArchiveEvent(this.discussion.id));
  }

  private _handleUnarchiveClick() {
    if (!this.discussion) return;
    this.dispatchEvent(
      new LearningDiscussionUnarchiveEvent(this.discussion.id),
    );
  }

  private _handleDeleteClick() {
    if (!this.discussion) return;
    this.dispatchEvent(new LearningDiscussionDeleteEvent(this.discussion.id));
  }

  private _handleEditClick() {
    this.dispatchEvent(new LearningDiscussionFormOpenEvent());
  }

  private _handleMarkdownClick() {
    this.markdownPopup.open = true;
  }

  private _handleGenerateClick() {
    this.generatePopup.open = true;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    titleStyle,
    discussionDetailStyle,
    css`
      .header {
        width: 100%;
      }

      learning-discussion-edit-form {
        display: block;
      }

      .display {
        display: block;
      }

      .clickable {
        cursor: pointer;
      }

      .status-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    `,
  ];
}
