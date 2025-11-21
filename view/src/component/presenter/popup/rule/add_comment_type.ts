import { LitElement, css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import "../base";
import type { BasePopupPresenter } from "../base";

@customElement("add-comment-type-popup-presenter")
export class AddCommentTypePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @state()
  private selectedColorIndex = 5;

  open() {
    this.basePopup.open();
  }

  render() {
    const colors = [
      "#0969da",
      "#d29922",
      "#1a7f37",
      "#cf222e",
      "#8250df",
      "#6e7781",
    ];

    return html`
      <base-popup-presenter>
        <h2 slot="header">コメント種類の追加</h2>
        <div slot="main">
          <div class="form-group">
            <label class="form-label">名前</label>
            <input
              type="text"
              class="form-control"
              placeholder="例: 補足情報"
            />
          </div>

          <div class="form-group">
            <label class="form-label">説明</label>
            <textarea
              class="form-control"
              placeholder="このコメント種類の用途を説明してください"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">色</label>
            <div class="color-picker">
              ${colors.map(
                (color, index) => html`
                  <div
                    class="color-option ${this.selectedColorIndex === index
                      ? "selected"
                      : ""}"
                    style="background-color: ${color}"
                    @click=${() => (this.selectedColorIndex = index)}
                  ></div>
                `
              )}
            </div>
          </div>
        </div>
        <div slot="footer">
          <button class="btn" @click=${() => this.basePopup.close()}>
            キャンセル
          </button>
          <button class="btn btn-primary" @click=${this.handleAdd}>追加</button>
        </div>
      </base-popup-presenter>
    `;
  }

  private handleAdd() {
    this.dispatchEvent(
      new CustomEvent("add", {
        bubbles: true,
        composed: true,
      })
    );
  }

  static styles = [
    buttonStyle,
    formStyle,
    css`
      h2 {
        margin: 0;
        font-size: 16px;
      }
      .color-picker {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .color-option {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid transparent;
      }
      .color-option.selected {
        border-color: var(--color-fg-default);
        transform: scale(1.1);
      }
    `,
  ];
}
