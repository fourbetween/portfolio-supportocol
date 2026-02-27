import { msg, str } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { formStyle } from "../../../shared/style/form";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/icons/icon-close";
import "../../../shared/ui/icons/icon-delete";
import "../../../shared/ui/icons/icon-edit";
import "../../../shared/ui/icons/icon-save";
import {
  WorkspaceProjectDeleteEvent,
  WorkspaceProjectUpdateEvent,
} from "../event/project";
import type { Project } from "../model/project";

@customElement("workspace-project-detail")
export class WorkspaceProjectDetail extends LitElement {
  @property({ type: Object })
  project!: Project;

  @state()
  private _isEditing = false;

  @state()
  private _editName = "";

  @state()
  private _editPremise = "";

  private _handleEdit() {
    this._editName = this.project.name;
    this._editPremise = this.project.premise;
    this._isEditing = true;
  }

  private _handleCancel() {
    this._isEditing = false;
  }

  private _handleSave() {
    if (!this._editName.trim()) return;
    this.dispatchEvent(
      new WorkspaceProjectUpdateEvent(
        this.project.id,
        this._editName.trim(),
        this._editPremise.trim(),
      ),
    );
    this._isEditing = false;
  }

  private _handleDelete() {
    if (
      confirm(
        msg(
          str`Are you sure you want to delete "${this.project.name}"? All discussions in this project will also be deleted.`,
        ),
      )
    ) {
      this.dispatchEvent(new WorkspaceProjectDeleteEvent(this.project.id));
    }
  }

  render() {
    if (this._isEditing) {
      return this._renderEditForm();
    }
    return this._renderDetail();
  }

  private _renderDetail() {
    return html`
      <div class="detail">
        <div class="detail-header">
          <h2 class="project-name">
            ${this.project.isDefault ? msg("Uncategorized") : this.project.name}
          </h2>
          ${!this.project.isDefault
            ? html`
                <div class="actions">
                  <button class="btn btn-delete" @click=${this._handleDelete}>
                    <ui-icon-delete></ui-icon-delete>
                  </button>
                  <button class="btn" @click=${this._handleEdit}>
                    <ui-icon-edit></ui-icon-edit>
                  </button>
                </div>
              `
            : html``}
        </div>
        ${this.project.premise
          ? html`
              <div class="premise">
                <h3>${msg("Premise")}</h3>
                <p>${this.project.premise}</p>
              </div>
            `
          : html``}
      </div>
    `;
  }

  private _renderEditForm() {
    return html`
      <div class="edit-form">
        <div class="field">
          <label>${msg("Project Name")}</label>
          <input
            type="text"
            .value=${this._editName}
            @input=${(e: InputEvent) =>
              (this._editName = (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Escape") this._handleCancel();
            }}
          />
        </div>
        <div class="field">
          <label>${msg("Premise")}</label>
          <textarea
            .value=${this._editPremise}
            rows="3"
            @input=${(e: InputEvent) =>
              (this._editPremise = (e.target as HTMLTextAreaElement).value)}
          ></textarea>
        </div>
        <div class="actions">
          <button
            class="btn cancel-button"
            @click=${this._handleCancel}
            title=${msg("Cancel")}
          >
            <ui-icon-close></ui-icon-close>
          </button>
          <button
            class="btn btn-primary save-button"
            ?disabled=${!this._editName.trim()}
            @click=${this._handleSave}
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
    formStyle,
    css`
      :host {
        display: block;
      }

      .detail {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .detail-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .project-name {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      .actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }

      .btn-delete {
        color: var(--color-danger-fg);
        border-color: var(--color-danger-fg);
      }

      .btn-delete:hover {
        color: #fff;
        background-color: var(--color-danger-fg);
      }

      .premise h3 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-muted);
      }

      .premise p {
        margin: 0;
        font-size: 14px;
        color: var(--color-fg-default);
        line-height: 1.5;
        white-space: pre-wrap;
      }

      .edit-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      textarea {
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
      }

      textarea:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }
    `,
  ];
}
