import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../model/rule";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { formStyle } from "../../../style/form";
import { listStyle } from "../../../style/list";
import { pageStyle } from "../../../style/page";

@customElement("rule-list-presenter")
export class RuleListPresenter extends LitElement {
  @property({ type: Array })
  rules: Rule[] = [];

  render() {
    return html`
      <div class="container">
        <div class="page-header">
          <h1 class="page-title">ルール一覧</h1>
          <a href="/rules/new" class="btn btn-primary">新規ルール作成</a>
        </div>

        <div class="form-group">
          <input
            type="text"
            class="form-control"
            placeholder="ルールを検索..."
          />
        </div>

        <ul class="list-group">
          ${this.rules.map(
            (rule) => html`
              <li class="list-group-item">
                <div class="rule-content">
                  <a href="#" class="rule-title">${rule.name}</a>
                  <div class="rule-description">${rule.description}</div>
                  <div class="rule-meta">
                    <span class="meta-item">作成者: ${rule.createdBy}</span>
                    <span class="meta-item">
                      更新日: ${new Date(rule.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </li>
            `
          )}
        </ul>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    listStyle,
    buttonStyle,
    formStyle,
    pageStyle,
    css`
      .container {
        max-width: 1012px;
        margin: 0 auto;
        padding: 24px;
      }
      .rule-content {
        flex: 1;
      }
      .rule-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-accent-fg);
        text-decoration: none;
      }
      .rule-title:hover {
        text-decoration: underline;
      }
      .rule-description {
        margin-top: 4px;
        color: var(--color-fg-muted);
        font-size: 14px;
      }
      .rule-meta {
        margin-top: 8px;
        font-size: 12px;
        color: var(--color-fg-muted);
      }
      .meta-item {
        margin-right: 16px;
      }
    `,
  ];
}
