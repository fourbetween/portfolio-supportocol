import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../shared/style/base";
import {
  WorkspaceDiscussionClearSelectionEvent,
  WorkspaceDiscussionSelectToggleEvent,
} from "../event/discussion-move";
import type { DiscussionSummaryForMove } from "../model/discussion-move";

@customElement("workspace-project-discussion-select-list")
export class WorkspaceProjectDiscussionSelectList extends LitElement {
  @property({ type: Array })
  discussions: DiscussionSummaryForMove[] = [];

  @property({ type: Array })
  selectedIds: string[] = [];

  private _handleToggle(discussionId: string) {
    this.dispatchEvent(new WorkspaceDiscussionSelectToggleEvent(discussionId));
  }

  private _handleSelectAll() {
    const allSelected = this._isAllSelected();
    if (allSelected) {
      this.dispatchEvent(new WorkspaceDiscussionClearSelectionEvent());
    } else {
      for (const d of this.discussions) {
        if (!this.selectedIds.includes(d.id)) {
          this.dispatchEvent(new WorkspaceDiscussionSelectToggleEvent(d.id));
        }
      }
    }
  }

  private _isAllSelected(): boolean {
    return (
      this.discussions.length > 0 &&
      this.discussions.every((d) => this.selectedIds.includes(d.id))
    );
  }

  render() {
    if (this.discussions.length === 0) {
      return html`
        <div class="empty">${msg("No discussions in this project.")}</div>
      `;
    }

    const allSelected = this._isAllSelected();

    return html`
      <div class="discussion-list">
        <label
          class="select-all-row"
          @click=${(e: Event) => {
            if ((e.target as HTMLElement).tagName === "INPUT") return;
            e.preventDefault();
            this._handleSelectAll();
          }}
        >
          <input
            type="checkbox"
            .checked=${allSelected}
            tabindex="-1"
            @change=${() => this._handleSelectAll()}
          />
          <span class="select-all-label">${msg("Select all")}</span>
        </label>
        ${this.discussions.map((d) => {
          const isSelected = this.selectedIds.includes(d.id);
          return html`
            <label
              class=${classMap({
                "discussion-row": true,
                selected: isSelected,
              })}
              @click=${(e: Event) => {
                if ((e.target as HTMLElement).tagName === "INPUT") return;
                e.preventDefault();
                this._handleToggle(d.id);
              }}
            >
              <input
                type="checkbox"
                .checked=${isSelected}
                tabindex="-1"
                @change=${() => this._handleToggle(d.id)}
              />
              <span class="discussion-theme">${d.theme}</span>
            </label>
          `;
        })}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }

      .empty {
        padding: 16px;
        text-align: center;
        color: var(--color-fg-muted);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
        font-size: 14px;
      }

      .discussion-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        overflow: hidden;
      }

      .select-all-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border-bottom: 1px solid var(--color-border-default);
        background-color: var(--color-canvas-subtle);
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        color: var(--color-fg-muted);
        -webkit-tap-highlight-color: transparent;
      }

      .select-all-row:hover {
        background-color: var(--color-canvas-inset);
      }

      .select-all-label {
        font-weight: 500;
      }

      .discussion-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        cursor: pointer;
        user-select: none;
        background-color: var(--color-canvas-default);
        transition: background-color 0.1s;
        -webkit-tap-highlight-color: transparent;
      }

      .discussion-row:not(:last-child) {
        border-bottom: 1px solid var(--color-border-default);
      }

      .discussion-row:hover {
        background-color: var(--color-canvas-subtle);
      }

      .discussion-row.selected {
        background-color: var(--color-success-subtle);
      }

      .discussion-row.selected:hover {
        background-color: var(--color-success-muted);
      }

      input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
        cursor: pointer;
        flex-shrink: 0;
      }

      .discussion-theme {
        flex: 1;
        font-size: 14px;
        color: var(--color-fg-default);
        overflow-wrap: break-word;
        word-break: break-word;
      }

      @media (pointer: coarse) {
        .discussion-row {
          padding: 14px 16px;
          min-height: 48px;
        }

        .select-all-row {
          padding: 12px 16px;
          min-height: 44px;
        }

        input[type="checkbox"] {
          width: 22px;
          height: 22px;
        }
      }
    `,
  ];
}
