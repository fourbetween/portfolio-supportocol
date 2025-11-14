import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../style/base";

@customElement("kanban-column-presenter")
export class KanbanColumnPresenter extends LitElement {
  @property({ type: String })
  title = "";

  @property({ type: Number })
  count = 0;

  render() {
    return html`
      <div class="kanban-column">
        <div class="column-header">
          <h3 class="column-title">
            ${this.title}
            <span class="column-count">(${this.count})</span>
          </h3>
          <button class="add-button">
            <span class="material-symbols-outlined">add</span>
          </button>
        </div>
        <div class="column-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .kanban-column {
        width: 18rem;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background-color: rgb(246, 248, 250);
        border-radius: 0.5rem;
        border: 1px solid rgb(208, 215, 222);
      }

      .column-header {
        padding: 0.75rem;
        border-bottom: 1px solid rgb(208, 215, 222);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .column-title {
        color: rgb(31, 35, 40);
        font-weight: 600;
        font-size: 0.875rem;
        margin: 0;
      }

      .column-count {
        color: rgb(101, 109, 118);
        font-weight: 400;
      }

      .add-button {
        background: none;
        border: none;
        color: rgb(101, 109, 118);
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
      }

      .add-button:hover {
        color: rgb(31, 111, 235);
      }

      .material-symbols-outlined {
        font-size: 1rem;
      }

      .column-content {
        flex: 1;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        overflow-y: auto;
      }
    `,
  ];
}
