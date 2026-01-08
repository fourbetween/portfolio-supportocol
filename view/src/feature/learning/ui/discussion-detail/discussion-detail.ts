import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { iconStyle } from "../../../../shared/style/icon";
import { DiscussionFormOpenEvent } from "../../event/discussion";
import type { Discussion } from "../../model/discussion";
import "../discussion-edit-form/discussion-edit-form";
import "../discussion-status-badge/discussion-status-badge";

@customElement("learning-discussion-detail")
export class LearningDiscussionDetail extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Boolean })
  isEditing = false;

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
    `;
  }

  private _renderEditForm() {
    return html`
      <learning-discussion-edit-form
        .theme=${this.discussion?.theme ?? ""}
        .status=${this.discussion?.status ?? "private"}
      ></learning-discussion-edit-form>
    `;
  }

  private _renderDisplay() {
    return html`
      <div class="display">
        <div class="theme-info">
          <h1 class="theme">${this.discussion?.theme}</h1>
          <learning-discussion-status-badge
            .status=${this.discussion?.status}
          ></learning-discussion-status-badge>
        </div>
        <button class="btn" @click=${this._handleEditClick}>
          <span class="material-symbols-outlined">edit</span>
        </button>
      </div>
    `;
  }

  private _handleEditClick() {
    this.dispatchEvent(new DiscussionFormOpenEvent());
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
        align-items: center;
        justify-content: space-between;
      }

      .theme {
        font-size: 16px;
        font-weight: 400;
        margin: 0;
      }

      .theme-info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .material-symbols-outlined {
        font-size: 16px;
      }
    `,
  ];
}
