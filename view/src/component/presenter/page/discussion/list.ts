import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import {
  listItemStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
  searchInputStyle,
} from "../../../../style/page";

@customElement("list-discussion-page-presenter")
export class ListDiscussionPagePresenter extends LitElement {
  @property({ attribute: false })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  @property({ attribute: false })
  onSearch?: (query: string) => void;

  private handleSearch(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.onSearch?.(target.value);
  }

  render() {
    return html`
      <main class="container container--wide">
        <h1>議論一覧</h1>
        <div class="search-section">
          <input
            type="text"
            class="search-input"
            placeholder="議論を検索..."
            @input=${this.handleSearch}
          />
        </div>
        <ul class="list">
          ${this.discussions.length === 0
            ? html`
                <li class="empty-message">議論がありません</li>
              `
            : this.discussions.map(
                (discussion) => html`
                  <li class="list-item">
                    <a
                      class="list-item-link"
                      href=${this.getDiscussionLink?.(discussion.id) ?? "#"}
                    >
                      <span class="list-item-title">${discussion.theme}</span>
                    </a>
                  </li>
                `
              )}
        </ul>
      </main>
    `;
  }

  static styles = [
    baseStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    searchInputStyle,
    listItemStyle,
  ];
}
