import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import {
  LearningDiscussionCreatedEvent,
  LearningDiscussionCreateEvent,
  LearningDiscussionDeletedEvent,
  LearningDiscussionDeleteEvent,
  LearningDiscussionSearchEvent,
} from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-add-form/discussion-add-form";
import "../ui/discussion-list/discussion-list";
import "../ui/discussion-search-bar/discussion-search-bar";

@customElement("learning-discussion-list-widget")
export class LearningDiscussionListWidget extends LitElement {
  @consume({ context: workspaceContext, subscribe: true })
  private workspace?: WorkspaceWithMember;

  @property({ type: Array })
  summaries: DiscussionSummary[] = [];

  @state()
  private _searchQuery = "";

  private async _handleAddDiscussion(e: LearningDiscussionCreateEvent) {
    if (!this.workspace) return;
    try {
      const data = await discussionRepository.create(
        this.workspace.workspace.id,
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

  private async _handleDeleteDiscussion(e: LearningDiscussionDeleteEvent) {
    if (!this.workspace) return;
    const { discussionId } = e;
    const discussion = this.summaries.find((d) => d.id === discussionId);
    if (!discussion) {
      return;
    }
    if (!confirm(`Are you sure you want to delete "${discussion.theme}"?`)) {
      return;
    }
    try {
      await discussionRepository.delete(
        this.workspace.workspace.id,
        discussionId,
      );
      this.dispatchEvent(new LearningDiscussionDeletedEvent(discussionId));
      showToast(this, "Succeeded.", "success", 2000);
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
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
            @learning-discussion-delete=${this._handleDeleteDiscussion}
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
        gap: 8px;
      }
      .content {
        flex: 1;
      }
    `,
  ];
}
