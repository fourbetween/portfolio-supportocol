import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Workbook } from "../../../model/workbook";
import { baseStyle } from "../../../style/base";

@customElement("workbook-list-presenter")
export class WorkbookListPresenter extends LitElement {
  @property({ type: Array })
  workbooks: Workbook[] = [];

  render() {
    return html`
      <div class="workbook-list">
        ${this.workbooks.length === 0
          ? html`
              <p class="empty-message">ワークブックがありません</p>
            `
          : html`
              <ul>
                ${this.workbooks.map(
                  (wb) => html`
                    <li class="workbook-item">
                      <div class="workbook-content">
                        <span class="workbook-title">${wb.title}</span>
                        <span class="workbook-status ${wb.status}">
                          ${wb.status === "published" ? "公開中" : "下書き"}
                        </span>
                      </div>
                    </li>
                  `
                )}
              </ul>
            `}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .workbook-list {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      }

      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .workbook-item {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 16px;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .workbook-item:hover {
        border-color: #1976d2;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }

      .workbook-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
      }

      .workbook-title {
        flex: 1;
        font-size: 16px;
        font-weight: 500;
        color: #333333;
      }

      .workbook-status {
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }

      .workbook-status.published {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .workbook-status.draft {
        background-color: #fff3e0;
        color: #ef6c00;
      }

      .empty-message {
        text-align: center;
        color: #757575;
        padding: 32px;
        font-size: 14px;
      }
    `,
  ];
}
