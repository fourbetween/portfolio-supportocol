import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { showErrorToast } from "../../../../event/toast";
import { accountMethods } from "../../../../model/account";
import type { Discussion } from "../../../../model/discussion";
import { buildPath } from "../../../../routes";

@customElement("list-discussion-page-container")
export class ListDiscussionPageContainer extends LitElement {
  @state()
  private discussions: Discussion[] = [];

  @state()
  private filteredDiscussions: Discussion[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/discussions", {
          headers: await accountMethods.authHeader(),
        });
        if (error) {
          showErrorToast(this, `議論の取得に失敗しました: ${error.message}`);
          return [] as Discussion[];
        }
        return data;
      },
      args: () => [],
      onComplete: (data) => {
        this.discussions = data ?? [];
        this.filteredDiscussions = this.discussions;
      },
    });
  }

  render() {
    return html`
      <list-discussion-page-presenter
        .discussions=${this.filteredDiscussions}
        .getDiscussionLink=${this.getDiscussionLink}
        .onSearch=${this.handleSearch}
      ></list-discussion-page-presenter>
    `;
  }

  private getDiscussionLink = (id: string): string => {
    return buildPath("discussion_item", { id });
  };

  private handleSearch = (query: string) => {
    if (query.trim() === "") {
      this.filteredDiscussions = this.discussions;
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredDiscussions = this.discussions.filter(
        (discussion) =>
          discussion.theme.toLowerCase().includes(lowerQuery) ||
          discussion.background.toLowerCase().includes(lowerQuery)
      );
    }
  };
}
