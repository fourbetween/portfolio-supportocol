import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { client } from "../api/client";
import type { Discussion } from "../model/discussion";
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
    const { data, error } = await client.POST("/learning/discussions", {
      body: { theme },
    });
    if (error) {
      showToast(this, error.message, "error");
      return;
    }
    this.discussions = [data, ...this.discussions];
  }

  private _handleSearch(query: string) {
    this._searchQuery = query;
  }

  private _handleSelect(discussion: Discussion) {
    this.dispatchEvent(
      new CustomEvent("select-discussion", {
        detail: discussion,
        bubbles: true,
        composed: true,
      })
    );
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
