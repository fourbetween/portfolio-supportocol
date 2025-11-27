import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { accountMethods } from "../../../../model/account";
import type {
  Comment,
  CommentType,
  Discussion,
} from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";

@customElement("item-discussion-page-container")
export class ItemDiscussionPageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @property({ type: String })
  discussionId = "";

  @state()
  private discussion?: Discussion;

  @state()
  private comments: Comment[] = [];

  @state()
  private commentTypes: CommentType[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async ([discussionId]) => {
        if (!discussionId) return undefined;
        const { data, error } = await client.GET(
          "/discussions/{discussionId}",
          {
            headers: await accountMethods.authHeader(),
            params: { path: { discussionId } },
          }
        );
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [this.discussionId] as const,
      onComplete: (data) => {
        this.discussion = data;
        if (data) {
          this.fetchRule(data.ruleId);
        }
      },
    });
  }

  private async fetchRule(ruleId: string) {
    const { data, error } = await client.GET("/rules/{ruleId}", {
      headers: await accountMethods.authHeader(),
      params: { path: { ruleId } },
    });
    if (error) {
      console.error("Failed to fetch rule:", error.message);
      return;
    }
    this.commentTypes = data.commentTypes;
  }

  render() {
    if (!this.discussion) {
      return nothing;
    }

    return html`
      <item-discussion-page-presenter
        .discussion=${this.discussion}
        .comments=${this.comments}
        .commentTypes=${this.commentTypes}
        .onAddComment=${this.handleAddComment}
      ></item-discussion-page-presenter>
    `;
  }

  private handleAddComment = (parentCommentId: string | null) => {
    // TODO: コメント追加機能の実装
    console.log("Add comment with parent:", parentCommentId);
  };

  static styles = [baseStyle];
}
