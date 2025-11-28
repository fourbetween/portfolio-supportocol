import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  formActionsStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
} from "../../../../style/page";

@customElement("create-rule-page-presenter")
export class CreateRulePagePresenter extends LitElement {
  @property({ attribute: false })
  rule: Rule = {
    id: "",
    name: "",
    description: "",
    createdBy: "",
    createdAt: "",
    commentTypes: [],
    commentTypePaths: [],
  };

  @property({ attribute: false })
  onSave?: (rule: Rule) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  render() {
    return html`
      <main class="container">
        <h1>ルール作成</h1>
        <form>
          <rule-form-presenter
            .rule=${this.rule}
            .onRuleChange=${(rule: Rule) => (this.rule = rule)}
          ></rule-form-presenter>
          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              @click=${this.handleCancel}
            >
              キャンセル
            </button>
            <button type="button" class="btn-primary" @click=${this.handleSave}>
              作成
            </button>
          </div>
        </form>
      </main>
    `;
  }

  private handleSave() {
    this.onSave?.(this.rule);
  }

  private handleCancel() {
    this.onCancel?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    formActionsStyle,
    css`
      .container {
        max-width: 900px;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-actions {
        margin-top: 24px;
      }
    `,
  ];
}
