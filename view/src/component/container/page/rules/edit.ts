import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { accountMethods } from "../../../../model/account";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";

@customElement("edit-rules-page-container")
export class EditRulesPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  @property({ type: String })
  ruleId!: string;

  private ruleTask = new Task(this, {
    task: async ([]) => {
      const { data, error } = await client.GET("/rules/{ruleId}", {
        headers: await accountMethods.authHeader(),
        params: {
          path: {
            ruleId: this.ruleId,
          },
        },
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
        ${this.ruleTask.render({
          complete: (rule) => html`
            <edit-rule-form-presenter
              .rule=${rule}
              .editRule=${(rule: Rule) => this.editRule(rule)}
            ></edit-rule-form-presenter>
          `,
          error: (e) =>
            html`
              <p>Error: ${e}</p>
            `,
        })}
      </div>
    `;
  }

  private async editRule(rule: Rule) {
    const { error } = await client.PUT("/rules/{ruleId}", {
      headers: await accountMethods.authHeader(),
      params: {
        path: {
          ruleId: this.ruleId,
        },
      },
      body: rule,
    });

    if (error) {
      console.error(error);
      return;
    }
  }

  static styles = [baseStyle, css``];
}
