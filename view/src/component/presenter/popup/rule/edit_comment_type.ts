import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { CommentType } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import type { BasePopupPresenter } from "../base";

@customElement("edit-comment-type-popup-presenter")
export class EditCommentTypePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @property({ attribute: false })
  commentType: CommentType | null = null;

  @state()
  private selectedColorIndex = 0;

  @state()
  private name = "";

  @state()
  private description = "";

  private static readonly COLORS = [
    "#0969da",
    "#d29922",
    "#1a7f37",
    "#cf222e",
    "#8250df",
    "#6e7781",
  ];

  open(commentType: CommentType) {
    this.commentType = commentType;
    this.name = commentType.name;
    this.description = commentType.description;
    this.selectedColorIndex = EditCommentTypePopupPresenter.COLORS.indexOf(
      commentType.color
    );
    if (this.selectedColorIndex === -1) {
      this.selectedColorIndex = 0;
    }
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">コメント種類の編集</span>
        <div slot="main">
          <div class="form-group">
            <label for="edit-name" class="form-label">名前</label>
            <input
              type="text"
              id="edit-name"
              class="form-control"
              placeholder="例: 補足情報"
              .value="${this.name}"
              @input="${(e: Event) =>
                (this.name = (e.target as HTMLInputElement).value)}"
            />
          </div>

          <div class="form-group">
            <label for="edit-description" class="form-label">説明</label>
            <textarea
              id="edit-description"
              class="form-control"
              placeholder="このコメント種類の用途を説明してください"
              .value="${this.description}"
              @input="${(e: Event) =>
                (this.description = (e.target as HTMLTextAreaElement).value)}"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">色</label>
            <div class="color-picker">
              ${EditCommentTypePopupPresenter.COLORS.map(
                (color, index) => html`
                  <button
                    type="button"
                    class="color-option ${this.selectedColorIndex === index
                      ? "selected"
                      : ""}"
                    style="background-color: ${color}"
                    aria-label="${color}"
                    @click=${() => (this.selectedColorIndex = index)}
                  ></button>
                `
              )}
            </div>
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${() => this.basePopup.close()}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleUpdate}>更新</button>
        </div>
      </base-popup-presenter>
    `;
  }

  private handleUpdate() {
    if (!this.commentType) return;

    this.dispatchEvent(
      new CustomEvent("update", {
        bubbles: true,
        composed: true,
        detail: {
          id: this.commentType.id,
          name: this.name,
          description: this.description,
          color: EditCommentTypePopupPresenter.COLORS[this.selectedColorIndex],
        },
      })
    );
    this.basePopup.close();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 16px;
      }

      .form-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      .form-control {
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }

      .form-control:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }

      textarea.form-control {
        min-height: 80px;
        resize: vertical;
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
        padding: 0;
      }

      .color-option:hover {
        transform: scale(1.1);
      }

      .color-option.selected {
        border-color: var(--color-fg-default);
        transform: scale(1.1);
      }
    `,
  ];
}
