import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { client } from "../../../../api/client";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { accountMethods } from "../../../../model/account";

@customElement("create-rules-page-container")
export class CreateRulesPageContainer extends LitElement {
  @property({ type: Boolean })
  isLoggedIn = false;

  render() {
    return html`
      <div class="container">
        <create-rule-form-presenter
          .createRule=${(rule: Rule) => this.createRule(rule)}
        ></create-rule-form-presenter>
      </div>
    `;
  }

  private async createRule(rule: Rule) {
    const { error } = await client.POST("/rules", {
      headers: await accountMethods.authHeader(),
      body: {
        name: rule.name,
        description: rule.description,
        commentTypes: rule.commentTypes.map((ct) => ({
          name: ct.name,
          description: ct.description,
          color: ct.color,
        })),
        commentTypePaths: rule.commentTypePaths.map((ctp) => ({
          fromCommentTypeId: ctp.fromCommentTypeId,
          toCommentTypeId: ctp.toCommentTypeId,
        })),
      },
    });

    if (error) {
      console.error(error);
      return;
    }
  }

  static styles = [baseStyle, css``];
}
