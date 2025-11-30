import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../model/rule";
import { baseStyle } from "../../../style/base";

@customElement("rule-details-presenter")
export class RuleDetailsPresenter extends LitElement {
  @property({ attribute: false })
  rule?: Rule;

  render() {
    if (!this.rule) return html``;

    return html`
      <details class="rule-details">
        <summary>ルール: ${this.rule.name}</summary>
        <div class="rule-content">
          <p class="rule-description">${this.rule.description}</p>
          <div class="rule-comment-types">
            <h3>コメント種類</h3>
            <ul class="rule-comment-type-list">
              ${this.rule.commentTypes.map(
                (type) => html`
                  <li class="rule-comment-type-item">
                    <span
                      class="color-badge"
                      style="background-color: ${type.color}"
                    ></span>
                    <span class="rule-comment-type-name">${type.name}</span>
                  </li>
                `
              )}
            </ul>
          </div>
          <div class="rule-paths">
            <h3>経路</h3>
            <ul class="rule-path-list">
              ${this.rule.commentTypePaths.map((path) => {
                const fromType = this.rule?.commentTypes.find(
                  (t) => t.id === path.fromCommentTypeId
                );
                const toType = this.rule?.commentTypes.find(
                  (t) => t.id === path.toCommentTypeId
                );
                return html`
                  <li class="rule-path-item">
                    <span
                      class="color-badge"
                      style="background-color: ${toType?.color ?? "#ccc"}"
                    ></span>
                    <span class="rule-path-type-name">
                      ${toType?.name ?? ""}
                    </span>
                    <span class="rule-path-arrow">←</span>
                    <span
                      class="color-badge"
                      style="background-color: ${fromType?.color ?? "#ccc"}"
                    ></span>
                    <span class="rule-path-type-name">
                      ${fromType?.name ?? ""}
                    </span>
                  </li>
                `;
              })}
            </ul>
          </div>
        </div>
      </details>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: block;
      }

      .rule-details {
        margin-bottom: 24px;
        background-color: var(--color-canvas-subtle);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
      }

      .rule-details summary {
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
        cursor: pointer;
        user-select: none;
      }

      .rule-details summary:hover {
        background-color: var(--color-canvas-default);
      }

      .rule-details[open] summary {
        border-bottom: 1px solid var(--color-border-default);
      }

      .rule-content {
        padding: 16px;
      }

      .rule-description {
        font-size: 14px;
        color: var(--color-fg-muted);
        line-height: 1.6;
        margin-bottom: 16px;
      }

      .rule-comment-types,
      .rule-paths {
        margin-bottom: 16px;
      }

      .rule-comment-types:last-child,
      .rule-paths:last-child {
        margin-bottom: 0;
      }

      .rule-comment-types h3,
      .rule-paths h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-fg-muted);
        margin-bottom: 8px;
      }

      .rule-comment-type-list,
      .rule-path-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .rule-comment-type-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        font-size: 13px;
      }

      .color-badge {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 3px;
      }

      .rule-comment-type-name {
        color: var(--color-fg-default);
      }

      .rule-path-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        font-size: 13px;
        color: var(--color-fg-default);
      }

      .rule-path-type-name {
        color: var(--color-fg-default);
      }

      .rule-path-arrow {
        color: var(--color-fg-muted);
        margin: 0 2px;
      }
    `,
  ];
}
