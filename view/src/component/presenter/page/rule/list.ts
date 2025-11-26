import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";

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
      <main class="container">
        <div class="section-header">
          <h1>ルール一覧</h1>
          <button class="btn-primary" @click=${this.handleCreateRule}>
            新規ルール作成
          </button>
        </div>
        <ul class="rule-list">
          ${this.rules.length === 0
            ? html`
                <li class="empty-message">ルールがありません</li>
              `
            : this.rules.map(
                (rule) => html`
                  <li class="rule-item">
                    <a
                      class="rule-link"
                      href=${this.getRuleLink?.(rule.id) ?? "#"}
                    >
                      <span class="rule-name">${rule.name}</span>
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
    css`
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--color-canvas-default);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0;
      }

      .rule-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .rule-item {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: var(--color-canvas-default);
        transition: background-color 0.2s ease;
      }

      .rule-item:hover {
        background-color: var(--color-canvas-subtle);
      }

      .rule-link {
        display: block;
        padding: 12px 16px;
        text-decoration: none;
        color: inherit;
      }

      .rule-name {
        font-size: 16px;
        font-weight: 500;
        color: var(--color-fg-default);
      }

      .empty-message {
        padding: 12px 16px;
        color: var(--color-fg-muted);
        font-size: 14px;
      }
    `,
  ];
}
