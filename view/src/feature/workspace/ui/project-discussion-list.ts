import { msg } from "@lit/localize";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { baseStyle } from "../../../shared/style/base";
import { listStyles } from "../../../shared/style/list";
import "../../../shared/ui/icons/icon-chevron-right";
import "../../../shared/ui/icons/icon-expand-more";
import {
  WorkspaceDiscussionSelectAllEvent,
  WorkspaceDiscussionSelectToggleEvent,
} from "../event/discussion-move";
import type { ProjectWithDiscussions } from "../model/discussion-move";

@customElement("workspace-project-discussion-list")
export class WorkspaceProjectDiscussionList extends LitElement {
  @property({ type: Array })
  projectDiscussions: ProjectWithDiscussions[] = [];

  @property({ type: Array })
  selectedIds: string[] = [];

  @state()
  private _expandedProjects = new Set<string>();

  private _toggleExpand(projectId: string) {
    const next = new Set(this._expandedProjects);
    if (next.has(projectId)) {
      next.delete(projectId);
    } else {
      next.add(projectId);
    }
    this._expandedProjects = next;
  }

  private _handleToggleDiscussion(discussionId: string) {
    this.dispatchEvent(new WorkspaceDiscussionSelectToggleEvent(discussionId));
  }

  private _handleSelectAll(projectId: string) {
    this.dispatchEvent(new WorkspaceDiscussionSelectAllEvent(projectId));
  }

  private _isAllSelected(pd: ProjectWithDiscussions): boolean {
    return (
      pd.discussions.length > 0 &&
      pd.discussions.every((d) => this.selectedIds.includes(d.id))
    );
  }

  private _selectedCountInProject(pd: ProjectWithDiscussions): number {
    return pd.discussions.filter((d) => this.selectedIds.includes(d.id)).length;
  }

  render() {
    if (this.projectDiscussions.length === 0) {
      return html`
        <div class="empty">${msg("No discussions found.")}</div>
      `;
    }

    return html`
      <div class="project-list">
        ${this.projectDiscussions.map((pd) => this._renderProject(pd))}
      </div>
    `;
  }

  private _renderProject(pd: ProjectWithDiscussions) {
    const isExpanded = this._expandedProjects.has(pd.projectId);
    const selectedCount = this._selectedCountInProject(pd);
    const allSelected = this._isAllSelected(pd);
    const projectName = pd.isDefault ? msg("Uncategorized") : pd.projectName;

    return html`
      <div class="project-section">
        <button
          class=${classMap({
            "project-header": true,
            expanded: isExpanded,
          })}
          @click=${() => this._toggleExpand(pd.projectId)}
        >
          ${isExpanded
            ? html`
                <ui-icon-expand-more></ui-icon-expand-more>
              `
            : html`
                <ui-icon-chevron-right></ui-icon-chevron-right>
              `}
          <span class="project-name">${projectName}</span>
          <span class="discussion-count">(${pd.discussions.length})</span>
          ${selectedCount > 0
            ? html`
                <span class="selected-badge">${selectedCount}</span>
              `
            : nothing}
        </button>
        ${isExpanded ? this._renderDiscussions(pd, allSelected) : nothing}
      </div>
    `;
  }

  private _renderDiscussions(pd: ProjectWithDiscussions, allSelected: boolean) {
    if (pd.discussions.length === 0) {
      return html`
        <div class="no-discussions">
          ${msg("No discussions in this project.")}
        </div>
      `;
    }

    return html`
      <div class="discussions">
        <label
          class="select-all-row"
          @click=${(e: Event) => {
            e.preventDefault();
            this._handleSelectAll(pd.projectId);
          }}
        >
          <input type="checkbox" .checked=${allSelected} tabindex="-1" />
          <span class="select-all-label">${msg("Select all")}</span>
        </label>
        ${pd.discussions.map((d) => {
          const isSelected = this.selectedIds.includes(d.id);
          return html`
            <label
              class=${classMap({
                "discussion-row": true,
                selected: isSelected,
              })}
              @click=${(e: Event) => {
                e.preventDefault();
                this._handleToggleDiscussion(d.id);
              }}
            >
              <input type="checkbox" .checked=${isSelected} tabindex="-1" />
              <span class="discussion-theme">${d.theme}</span>
            </label>
          `;
        })}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    listStyles,
    css`
      :host {
        display: block;
      }

      .project-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        overflow: hidden;
      }

      .project-section:not(:last-child) {
        border-bottom: 1px solid var(--color-border-default);
      }

      .project-header {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background-color: var(--color-canvas-subtle);
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
        text-align: left;
        transition: background-color 0.15s;
      }

      .project-header:hover {
        background-color: var(--color-canvas-inset);
      }

      .project-name {
        flex: 1;
      }

      .discussion-count {
        color: var(--color-fg-muted);
        font-weight: 400;
        font-size: 13px;
      }

      .selected-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        background-color: var(--color-accent-fg);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        border-radius: 10px;
      }

      .discussions {
        display: flex;
        flex-direction: column;
      }

      .select-all-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px 8px 44px;
        border-bottom: 1px solid var(--color-border-default);
        background-color: var(--color-canvas-default);
        cursor: pointer;
        user-select: none;
        font-size: 12px;
        color: var(--color-fg-muted);
        -webkit-tap-highlight-color: transparent;
      }

      .select-all-row:hover {
        background-color: var(--color-canvas-subtle);
      }

      .select-all-label {
        font-weight: 500;
      }

      .discussion-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px 10px 44px;
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

      .no-discussions {
        padding: 12px 16px 12px 44px;
        color: var(--color-fg-muted);
        font-size: 13px;
      }

      /* Touch optimization: larger tap targets */
      @media (pointer: coarse) {
        .project-header {
          padding: 14px 16px;
          min-height: 48px;
        }

        .discussion-row {
          padding: 14px 16px 14px 44px;
          min-height: 48px;
        }

        .select-all-row {
          padding: 12px 16px 12px 44px;
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
