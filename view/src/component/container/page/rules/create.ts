import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";

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

  private createRule(rule: Rule) {
    console.log(rule);
  }

  static styles = [baseStyle, css``];
}
