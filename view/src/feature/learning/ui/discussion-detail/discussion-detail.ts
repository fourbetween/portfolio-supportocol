import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { LearningDiscussionFormOpenEvent } from "../../event/discussion";
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
          <learning-discussion-status-badge
            .status=${this.discussion?.status}
            class="clickable"
            @click=${this._handleBadgeClick}
          ></learning-discussion-status-badge>
        </div>
        <div class="content-row">
          <h1 class="theme">${this.discussion?.theme}</h1>
          <button class="btn" @click=${this._handleEditClick}>
            <span class="material-symbols-outlined">edit</span>
          </button>
        </div>
        ${this.discussion?.conclusion
          ? html`
              <div class="conclusion-row">
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

  private _handleEditClick() {
    this.dispatchEvent(new LearningDiscussionFormOpenEvent());
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
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

      .content-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .theme {
        font-size: 16px;
        font-weight: 400;
        margin: 0;
      }

      .conclusion-row {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--color-border-muted);
      }

      .conclusion {
        font-size: 14px;
        color: var(--color-fg-muted);
        margin: 0;
        white-space: pre-wrap;
      }

      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
