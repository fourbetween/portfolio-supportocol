import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { RuleFormPresenter } from "../rule";

@customElement("create-rule-form-presenter")
export class CreateRuleFormPresenter extends RuleFormPresenter {
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
            <button class="btn btn-primary">作成する</button>
          </div>
        </div>

        ${this.renderForm()}
      </div>
    `;
  }
}
