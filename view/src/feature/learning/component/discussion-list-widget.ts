import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-add";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningDiscussionArchiveFilterEvent,
  LearningDiscussionCreatedEvent,
  LearningDiscussionCreateEvent,
  LearningDiscussionSearchEvent,
} from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-create-popup";
import "../ui/discussion-list";
import "../ui/discussion-search-bar";

@customElement("learning-discussion-list-widget")
export class LearningDiscussionListWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  private workspace?: WorkspaceWithMember;

  @property({ type: Array })
  summaries: DiscussionSummary[] = [];

  @property({ type: String })
  projectId?: string;

  @state()
  private _searchQuery = "";

  @state()
  private _archived = false;

  @state()
  private _createPopupOpen = false;

  private async _handleAddDiscussion(e: LearningDiscussionCreateEvent) {
    if (!this.workspace || !this.projectId) return;
    try {
      const hasSource =
        (e.sourceText && e.sourceText.trim().length > 0) ||
        (e.sourceUrls && e.sourceUrls.length > 0);

      let data;
      if (hasSource) {
        data = await discussionRepository.generate(
          this.workspace.workspace.id,
          this.projectId,
          e.sourceText ?? "",
          e.sourceUrls ?? [],
          e.modelLevel ?? "medium",
          e.theme,
        );
      } else {
        data = await discussionRepository.create(
          this.workspace.workspace.id,
          this.projectId,
          e.theme ?? "",
          e.language ?? "ja",
          e.premise,
        );
      }
      this.dispatchEvent(new LearningDiscussionCreatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private _handleSearch(e: LearningDiscussionSearchEvent) {
    this._searchQuery = e.query;
  }

  private _handleToggleArchived(e: Event) {
    this._archived = (e.target as HTMLInputElement).checked;
    this.dispatchEvent(
      new LearningDiscussionArchiveFilterEvent(this._archived),
    );
  }

  private get _filteredSummaries() {
    return this.summaries.filter((d) =>
      d.theme.toLowerCase().includes(this._searchQuery.toLowerCase()),
    );
  }

  render() {
    return html`
      <div class="widget">
        <div class="header">
          <div class="filters">
            <label class="archived-filter">
              <input
                type="checkbox"
                .checked=${this._archived}
                @change=${this._handleToggleArchived}
              />
              ${msg("Show archived")}
            </label>
          </div>
          <div class="search-row">
            <learning-discussion-search-bar
              .value=${this._searchQuery}
              @learning-discussion-search=${this._handleSearch}
            ></learning-discussion-search-bar>
            <button
              class="btn btn-primary add-button"
              @click=${() => (this._createPopupOpen = true)}
              title=${msg("New discussion")}
            >
              <ui-icon-add></ui-icon-add>
            </button>
          </div>
        </div>
        <div class="content">
          <learning-discussion-list
            .summaries=${this._filteredSummaries}
          ></learning-discussion-list>
        </div>
        <learning-discussion-create-popup
          .open=${this._createPopupOpen}
          .isFree=${this.workspace?.workspace.subscription.plan.isFree ?? true}
          @popup-closed=${() => (this._createPopupOpen = false)}
          @learning-discussion-create=${this._handleAddDiscussion}
        ></learning-discussion-create-popup>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .widget {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .header {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .filters {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8px;
        font-size: 12px;
        color: var(--color-fg-muted);
      }
      .archived-filter {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;
      }
      .search-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .search-row learning-discussion-search-bar {
        flex: 1;
        min-width: 0;
      }
      .add-button {
        flex-shrink: 0;
      }
      .content {
        flex: 1;
      }
    `,
  ];
}
