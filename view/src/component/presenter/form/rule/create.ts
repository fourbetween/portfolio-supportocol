import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { RuleFormPresenter } from "../rule";

@customElement("create-rule-form-presenter")
export class CreateRuleFormPresenter extends RuleFormPresenter {
  @property({ attribute: false })
  createRule!: (rule: Rule) => void;

  render() {
    return html`
      <div class="container">
        <div class="page-header">
          <div>
            <h1>新しいルールを作成</h1>
            <p class="header-description">
              議論の構造を定義する新しいルールセットを作成します
            </p>
          </div>
          <div class="header-actions">
            <button class="btn">キャンセル</button>
            <button class="btn btn-primary" @click=${this._handleCreate}>
              作成する
            </button>
          </div>
        </div>

        ${this.renderForm()}
      </div>
    `;
  }

  private _handleCreate() {
    this.createRule(this.rule);
  }
}
