import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import "../../../shared/ui/icons/icon-account-tree";

@customElement("learning-comment-frame-badge")
export class LearningCommentFrameBadge extends LitElement {
  render() {
    return html`
      <div class="frame-badge">
        <ui-icon-account-tree></ui-icon-account-tree>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      :host {
        display: inline-block;
      }
      .frame-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
        border-radius: 2em;
        white-space: nowrap;
        border: 1px solid var(--color-border-default);
        color: var(--color-fg-muted);
        background-color: var(--color-canvas-subtle);
        cursor: pointer;
      }
      .frame-badge:hover {
        background-color: var(--color-canvas-default);
      }
    `,
  ];
}
