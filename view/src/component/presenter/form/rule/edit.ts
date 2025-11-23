import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { RuleFormPresenter } from "../rule";

@customElement("edit-rule-form-presenter")
export class EditRuleFormPresenter extends RuleFormPresenter {
  render() {
    return html`
      <div class="container">
        <div class="page-header">
          <div>
            <h1>${this.rule.name}</h1>
            <p class="header-description">ルールの詳細設定と構造定義</p>
          </div>
          <div class="header-actions">
            <button class="btn">変更を破棄</button>
            <button class="btn btn-primary">保存する</button>
          </div>
        </div>

        ${this.renderForm()}
      </div>
    `;
  }
}
