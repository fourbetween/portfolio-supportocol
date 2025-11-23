import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../api/client";
import { accountMethods } from "../../../model/account";
import { baseStyle } from "../../../style/base";

@customElement("rules-page-container")
export class RulesPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  private rulesTask = new Task(this, {
    task: async ([]) => {
      const { data, error } = await client.GET("/rules", {
        headers: await accountMethods.authHeader(),
      });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    args: () => [],
  });

  render() {
    return html`
      <div class="container">
        ${this.rulesTask.render({
          complete: (rules) => html`
            <rule-list-presenter .rules=${rules}></rule-list-presenter>
          `,
          error: (e) =>
            html`
              <p>Error: ${e}</p>
            `,
        })}
      </div>
    `;
  }

  static styles = [baseStyle, css``];
}
