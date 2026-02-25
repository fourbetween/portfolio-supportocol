import { msg, str } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import { inputStyle } from "../../../shared/style/input";
import {
  WorkspaceDiscussionClearSelectionEvent,
  WorkspaceDiscussionMoveEvent,
} from "../event/discussion-move";
import type { Project } from "../model/project";

@customElement("workspace-discussion-move-bar")
export class WorkspaceDiscussionMoveBar extends LitElement {
  @property({ type: Number })
  selectedCount = 0;

  @property({ type: Array })
  projects: Project[] = [];

  @property({ type: Boolean })
  loading = false;

  @state()
  private _targetProjectId = "";

  private _handleProjectChange(e: Event) {
    this._targetProjectId = (e.target as HTMLSelectElement).value;
  }

  private _handleMove() {
    if (!this._targetProjectId) return;
    this.dispatchEvent(
      new WorkspaceDiscussionMoveEvent([], this._targetProjectId),
    );
  }

  private _handleClear() {
    this.dispatchEvent(new WorkspaceDiscussionClearSelectionEvent());
  }

  render() {
    if (this.selectedCount === 0) {
      return html``;
    }

    return html`
      <div class="bar">
        <div class="info">
          <span class="count">${msg(str`${this.selectedCount} selected`)}</span>
          <button
            class="clear-button"
            @click=${this._handleClear}
            aria-label=${msg("Clear selection")}
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="actions">
          <select
            .value=${this._targetProjectId}
            @change=${this._handleProjectChange}
          >
            <option value="" disabled selected>${msg("Move to...")}</option>
            ${this.projects.map(
              (p) => html`
                <option value=${p.id}>
                  ${p.isDefault ? msg("Uncategorized") : p.name}
                </option>
              `,
            )}
          </select>
          <button
            class="btn btn-primary"
            ?disabled=${!this._targetProjectId || this.loading}
            @click=${this._handleMove}
          >
            <span class="material-symbols-outlined">drive_file_move</span>
            ${msg("Move")}
          </button>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    inputStyle,
    css`
      :host {
        display: block;
        position: sticky;
        bottom: 0;
        z-index: 100;
      }

      .bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 8px;
        box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
        animation: slideUp 0.2s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .info {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .count {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
        white-space: nowrap;
      }

      .clear-button {
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

      .clear-button:hover {
        background-color: var(--color-neutral-muted);
        color: var(--color-fg-default);
      }

      .clear-button .material-symbols-outlined {
        font-size: 18px;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      select {
        min-width: 140px;
        max-width: 200px;
      }

      .btn .material-symbols-outlined {
        font-size: 18px;
      }

      /* Responsive: stack vertically on small screens */
      @media (max-width: 480px) {
        .bar {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .info {
          justify-content: space-between;
        }

        .actions {
          flex-direction: column;
        }

        select {
          width: 100%;
          max-width: none;
        }

        .btn {
          width: 100%;
        }
      }

      /* Touch optimization */
      @media (pointer: coarse) {
        .bar {
          padding: 14px 16px;
        }

        select {
          min-height: 40px;
        }

        .btn {
          min-height: 40px;
          padding: 8px 20px;
        }

        .clear-button {
          padding: 8px;
        }
      }
    `,
  ];
}
