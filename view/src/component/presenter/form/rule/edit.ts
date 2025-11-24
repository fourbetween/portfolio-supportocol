import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { RuleFormPresenter } from "../rule";

@customElement("edit-rule-form-presenter")
export class EditRuleFormPresenter extends RuleFormPresenter {
  @property({ attribute: false })
  editRule!: (rule: Rule) => Promise<void>;

  render() {
    return html`
      <div class="container">
        <div class="page-header">
          <div>
            <h1>${this.rule.name}</h1>
            <p class="header-description">ルールの詳細設定と構造定義</p>
          </div>
          <div class="header-actions">
            <button class="btn" @click=${this.cancel}>キャンセル</button>
            <button class="btn btn-primary" @click=${this.save}>
              保存する
            </button>
          </div>
        </div>

        ${this.renderForm()}
      </div>
    `;
  }

  private cancel() {
    window.history.back();
  }

  private async save() {
    await this.editRule(this.rule);
  }
}
