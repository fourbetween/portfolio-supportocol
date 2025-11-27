import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { accountMethods } from "../../../../model/account";
import type { Rule } from "../../../../model/rule";
import { navigate } from "../../../../routes";
import { baseStyle } from "../../../../style/base";

@customElement("create-rule-page-container")
export class CreateRulePageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @state()
  private isSubmitting = false;

  render() {
    return html`
      <create-rule-page-presenter
        .onSave=${this.handleSave}
        .onCancel=${this.handleCancel}
      ></create-rule-page-presenter>
    `;
  }

  private handleSave = async (rule: Rule) => {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const { error } = await client.POST("/rules", {
        headers: await accountMethods.authHeader(),
        body: {
          name: rule.name,
          description: rule.description,
          commentTypes: rule.commentTypes,
          commentTypePaths: rule.commentTypePaths,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (this.router) {
        navigate(this.router, "rule_list");
      }
    } finally {
      this.isSubmitting = false;
    }
  };

  private handleCancel = () => {
    if (this.router) {
      navigate(this.router, "rule_list");
    }
  };

  static styles = [baseStyle];
}
