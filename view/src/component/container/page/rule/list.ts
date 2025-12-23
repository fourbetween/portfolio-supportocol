import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { showToast } from "../../../../event/toast";
import type { Rule } from "../../../../model/rule";
import { buildPath, navigate } from "../../../../routes";

@customElement("list-rule-page-container")
export class ListRulePageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @state()
  private rules: Rule[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        const { data, error } = await client.GET("/rules");
        if (error) {
          showToast(
            this,
            `ルールの取得に失敗しました: ${error.message}`,
            "error"
          );
          return [] as Rule[];
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
    if (this.router) {
      navigate(this.router, "rule_new");
    }
  };
}
