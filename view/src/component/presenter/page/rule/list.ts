import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  listItemStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
  sectionStyle,
} from "../../../../style/page";

@customElement("list-rule-page-presenter")
export class ListRulePagePresenter extends LitElement {
  @property({ attribute: false })
  rules: Rule[] = [];

  @property({ attribute: false })
  getRuleLink?: (id: string) => string;

  @property({ attribute: false })
  onCreateRule?: () => void;

  render() {
    return html`
      <main class="container container--wide">
        <div class="section-header">
          <h1>ルール一覧</h1>
          <button class="btn-primary" @click=${this.handleCreateRule}>
            新規ルール作成
          </button>
        </div>
        <ul class="list">
          ${this.rules.length === 0
            ? html`
                <li class="empty-message">ルールがありません</li>
              `
            : this.rules.map(
                (rule) => html`
                  <li class="list-item">
                    <a
                      class="list-item-link"
                      href=${this.getRuleLink?.(rule.id) ?? "#"}
                    >
                      <span class="list-item-title">${rule.name}</span>
                    </a>
                  </li>
                `
              )}
        </ul>
      </main>
    `;
  }

  private handleCreateRule() {
    this.onCreateRule?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    sectionStyle,
    listItemStyle,
  ];
}
