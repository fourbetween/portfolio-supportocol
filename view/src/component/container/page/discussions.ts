import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import { baseStyle } from "../../../style/base";
import type { CreateDiscussionData } from "../../presenter/popup/discussion/create";

@customElement("discussions-page-container")
export class DiscussionsPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  private _task = new Task(this, {
    task: async ([]) => {
      const [discussionsRes, rulesRes] = await Promise.all([
        client.GET("/discussions", {
          headers: await accountMethods.authHeader(),
        }),
        client.GET("/rules", {
          headers: await accountMethods.authHeader(),
        }),
      ]);

      if (discussionsRes.error) {
        throw new Error(discussionsRes.error.message);
      }
      if (rulesRes.error) {
        throw new Error(rulesRes.error.message);
      }

      return {
        discussions: discussionsRes.data,
        rules: rulesRes.data,
      };
    },
    args: () => [],
  });

  render() {
    return html`
      <div class="container">
        ${this._task.render({
          complete: ({ discussions, rules }) => html`
            <discussion-list-presenter
              .discussions=${discussions}
              .rules=${rules}
              .onCreate=${(data: CreateDiscussionData) =>
                this.handleCreateDiscussion(data)}
            ></discussion-list-presenter>
          `,
          error: (e) =>
            html`
              <p>Error: ${e}</p>
            `,
        })}
      </div>
    `;
  }

  private async handleCreateDiscussion(data: CreateDiscussionData) {
    const { error } = await client.POST("/discussions", {
      headers: await accountMethods.authHeader(),
      body: {
        theme: data.theme,
        background: "",
        conclusion: "",
        ruleId: data.ruleId,
        visibilityLevel: data.visibilityLevel as
          | "everyone"
          | "authenticated"
          | "owner",
        commentPermissionLevel: data.commentPermissionLevel as
          | "everyone"
          | "authenticated"
          | "owner",
      },
    });
    if (error) {
      console.error(error);
      return;
    }
    this._task.run();
  }

  static styles = [baseStyle, css``];
}
