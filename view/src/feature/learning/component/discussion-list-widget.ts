import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import {
  DiscussionCreatedEvent,
  DiscussionDeletedEvent,
  SelectDiscussionEvent,
} from "../event/discussion";
import type { Discussion } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-add-form/discussion-add-form";
import "../ui/discussion-list/discussion-list";
import "../ui/discussion-search-bar/discussion-search-bar";

@customElement("learning-discussion-list-widget")
export class LearningDiscussionListWidget extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  @state()
  private _searchQuery = "";

  private async _handleAddDiscussion(theme: string) {
    try {
      const data = await discussionRepository.create(theme);
      this.dispatchEvent(new DiscussionCreatedEvent(data));
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private _handleSearch(query: string) {
    this._searchQuery = query;
  }

  private _handleSelect(discussion: Discussion) {
    this.dispatchEvent(new SelectDiscussionEvent(discussion));
  }

  private async _handleDeleteDiscussion(discussion: Discussion) {
    if (!confirm(`Are you sure you want to delete "${discussion.theme}"?`)) {
      return;
    }
    try {
      await discussionRepository.delete(discussion.id);
      this.dispatchEvent(new DiscussionDeletedEvent(discussion));
      showToast(this, "Deleted.", "success", 2000);
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  render() {
    const filteredDiscussions = this.discussions.filter((d) =>
      d.theme.toLowerCase().includes(this._searchQuery.toLowerCase())
    );

    return html`
      <div class="widget">
        <div class="header">
          <learning-discussion-search-bar
            .value=${this._searchQuery}
            .onInput=${(q: string) => this._handleSearch(q)}
          ></learning-discussion-search-bar>
        </div>
        <div class="add-form">
          <learning-discussion-add-form
            .onSubmit=${(t: string) => this._handleAddDiscussion(t)}
          ></learning-discussion-add-form>
        </div>
        <div class="content">
          <learning-discussion-list
            .discussions=${filteredDiscussions}
            .onSelect=${(d: Discussion) => this._handleSelect(d)}
            .onDelete=${(d: Discussion) => this._handleDeleteDiscussion(d)}
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
