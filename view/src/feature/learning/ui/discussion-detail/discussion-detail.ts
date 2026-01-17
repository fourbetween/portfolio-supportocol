import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { titleStyle } from "../../../../shared/style/title";
import "../../../../shared/ui/discussion-archive-badge/discussion-archive-badge";
import {
  LearningDiscussionArchiveEvent,
  LearningDiscussionFormOpenEvent,
  LearningDiscussionUnarchiveEvent,
} from "../../event/discussion";
import type { Discussion } from "../../model/discussion";
import "../discussion-edit-form/discussion-edit-form";
import "../discussion-status-badge/discussion-status-badge";
import "../discussion-status-popup/discussion-status-popup";
import type { DiscussionStatusPopup } from "../discussion-status-popup/discussion-status-popup";

@customElement("learning-discussion-detail")
export class LearningDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Boolean })
  isEditing = false;

  @query("learning-discussion-status-popup")
  private popup!: DiscussionStatusPopup;

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
    `;
  }

  private _renderEditForm() {
    return html`
      <learning-discussion-edit-form
        .theme=${this.discussion?.theme ?? ""}
        .conclusion=${this.discussion?.conclusion ?? ""}
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
            <ui-discussion-archive-badge
              .archived=${!!this.discussion?.archivedAt}
            ></ui-discussion-archive-badge>
          </div>
          <div class="actions">
            ${this.discussion?.archivedAt
              ? html`
                  <button class="btn" @click=${this._handleUnarchiveClick}>
                    <span class="material-symbols-outlined">unarchive</span>
                  </button>
                `
              : html`
                  <button class="btn" @click=${this._handleArchiveClick}>
                    <span class="material-symbols-outlined">archive</span>
                  </button>
                `}
            <button class="btn" @click=${this._handleEditClick}>
              <span class="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
        <div class="theme-row">
          <div class="section-title">Theme</div>
          <h1 class="theme">${this.discussion?.theme}</h1>
        </div>
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
                <div class="section-title">Conclusion</div>
                <p class="conclusion">${this.discussion.conclusion}</p>
              </div>
            `
          : html``}
      </div>
    `;
  }

  private _handleBadgeClick() {
    this.popup.open = true;
  }

  private _handleArchiveClick() {
    if (!this.discussion) return;
    this.dispatchEvent(new LearningDiscussionArchiveEvent(this.discussion.id));
  }

  private _handleUnarchiveClick() {
    if (!this.discussion) return;
    this.dispatchEvent(
      new LearningDiscussionUnarchiveEvent(this.discussion.id)
    );
  }

  private _handleEditClick() {
    this.dispatchEvent(new LearningDiscussionFormOpenEvent());
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    titleStyle,
    css`
      .container {
        padding: 8px 0;
        background-color: var(--color-canvas-default);
      }

      .header {
        display: flex;
        align-items: center;
      }

      learning-discussion-edit-form,
      .display {
        width: 100%;
      }

      .display {
        display: flex;
        flex-direction: column;
      }

      .clickable {
        cursor: pointer;
      }

      .theme-row {
        padding-top: 8px;
      }

      .badge-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

      .theme {
        font-size: 16px;
        font-weight: 400;
        margin: 0;
      }

      .conclusion-row {
        margin-top: 8px;
        padding-top: 8px;
      }

      .conclusion {
        font-size: 14px;
        margin: 0;
        white-space: pre-wrap;
        padding-bottom: 8px;
      }

      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
