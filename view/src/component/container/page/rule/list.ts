import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { accountMethods } from "../../../../model/account";
import type { Rule } from "../../../../model/rule";
import { buildPath } from "../../../../routes";

@customElement("list-rule-page-container")
export class ListRulePageContainer extends LitElement {
  @state()
  private rules: Rule[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/rules", {
          headers: await accountMethods.authHeader(),
        });
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [],
      onComplete: (data) => {
        this.rules = data ?? [];
      },
    });
  }

  render() {
    return html`
      <list-rule-page-presenter
        .rules=${this.rules}
        .getRuleLink=${this.getRuleLink}
        .onCreateRule=${this.handleCreateRule}
      ></list-rule-page-presenter>
    `;
  }

  private getRuleLink = (id: string): string => {
    return buildPath("rule_item", { id });
  };

  private handleCreateRule = () => {
    const event = new CustomEvent("navigate", {
      bubbles: true,
      composed: true,
      detail: { name: "rule_new" },
    });
    this.dispatchEvent(event);
  };
}
