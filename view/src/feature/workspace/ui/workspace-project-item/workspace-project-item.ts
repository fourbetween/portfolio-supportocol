import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { listStyles } from "../../../../shared/style/list";
import {
  WorkspaceProjectDeleteEvent,
  WorkspaceProjectUpdateEvent,
} from "../../event/project";
import type { Project } from "../../model/project";

@customElement("workspace-project-item")
export class WorkspaceProjectItem extends LitElement {
  @property({ type: Object })
  project!: Project;

  @state()
  private isEditing = false;

  @state()
  private editName = "";

  private handleEdit() {
    this.editName = this.project.name;
    this.isEditing = true;
  }

  private handleCancel() {
    this.isEditing = false;
  }

  private handleSave() {
    if (this.editName && this.editName !== this.project.name) {
      this.dispatchEvent(
        new WorkspaceProjectUpdateEvent(this.project.id, this.editName),
      );
    }
    this.isEditing = false;
  }

  private handleDelete() {
    if (confirm(`Are you sure you want to delete "${this.project.name}"?`)) {
      this.dispatchEvent(new WorkspaceProjectDeleteEvent(this.project.id));
    }
  }

  render() {
    if (this.isEditing) {
      return html`
        <div class="item editing">
          <input
            type="text"
            .value=${this.editName}
            @input=${(e: InputEvent) =>
              (this.editName = (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") this.handleSave();
              if (e.key === "Escape") this.handleCancel();
            }}
          />
          <button class="icon-button save" @click=${this.handleSave}>
            <span class="material-symbols-outlined">check</span>
          </button>
          <button class="icon-button cancel" @click=${this.handleCancel}>
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      `;
    }

    return html`
      <div class="item">
        <span class="name">${this.project.name}</span>
        ${this.project.isDefault
          ? html`
              <span class="badge">Default</span>
            `
          : html`
              <div class="actions">
                <button
                  class="icon-button edit"
                  aria-label="Edit project"
                  @click=${this.handleEdit}
                >
                  <span class="material-symbols-outlined">edit</span>
                </button>
                <button
                  class="icon-button delete"
                  aria-label="Delete project"
                  @click=${this.handleDelete}
                >
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </div>
            `}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    listStyles,
    css`
      :host {
        display: block;
      }
      .item {
        gap: 8px;
        cursor: default;
      }
      .item.editing {
        cursor: default;
      }
      .name {
        flex: 1;
      }
      .badge {
        font-size: 0.75rem;
        padding: 2px 6px;
        background-color: var(--color-neutral-muted);
        border-radius: 12px;
        color: var(--color-fg-muted);
      }
      .actions {
        display: flex;
        gap: 4px;
        opacity: 0;
      }
      .item:hover .actions {
        opacity: 1;
      }
      .icon-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 4px;
        color: var(--color-fg-muted);
      }
      .icon-button:hover {
        background-color: var(--color-neutral-muted);
      }
      .icon-button.delete:hover {
        color: var(--color-danger-fg);
      }
      .icon-button.save:hover {
        color: var(--color-success-fg);
      }

      input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        font-size: 1rem;
      }
      input:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }
    `,
  ];
}
