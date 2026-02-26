import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningDiscussionArchiveFilterEvent,
  LearningDiscussionCreatedEvent,
  LearningDiscussionCreateEvent,
  LearningDiscussionSearchEvent,
} from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-add-form";
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

  private async _handleAddDiscussion(e: LearningDiscussionCreateEvent) {
    if (!this.workspace || !this.projectId) return;
    try {
      const data = await discussionRepository.create(
        this.workspace.workspace.id,
        this.projectId,
        e.theme,
        e.status,
      );
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
          <learning-discussion-search-bar
            .value=${this._searchQuery}
            @learning-discussion-search=${this._handleSearch}
          ></learning-discussion-search-bar>
        </div>
        <div class="add-form">
          <learning-discussion-add-form
            @learning-discussion-create=${this._handleAddDiscussion}
          ></learning-discussion-add-form>
        </div>
        <div class="content">
          <learning-discussion-list
            .summaries=${this._filteredSummaries}
          ></learning-discussion-list>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
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
      .content {
        flex: 1;
      }
    `,
  ];
}
