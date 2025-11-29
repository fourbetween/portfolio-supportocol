import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { CommentStatus } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import type { BasePopupPresenter } from "../base";

const STATUS_LABELS: Record<CommentStatus, string> = {
  unassigned: "割り当て待ち",
  assigned: "割り当て済み",
  archived: "アーカイブ",
  deleted: "削除",
};

@customElement("change-status-popup-presenter")
export class ChangeStatusPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private popup!: BasePopupPresenter;

  @query("#comment-status")
  private statusSelect!: HTMLSelectElement;

  @property({ attribute: false })
  currentStatus: CommentStatus = "unassigned";

  @property({ attribute: false })
  onChangeStatus?: (status: CommentStatus) => void;

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">ステータスを変更</span>
        <div slot="main">
          <div class="form-group">
            <label for="comment-status">ステータス</label>
            <select id="comment-status">
              ${(Object.keys(STATUS_LABELS) as CommentStatus[]).map(
                (status) => html`
                  <option
                    value="${status}"
                    ?selected=${this.currentStatus === status}
                  >
                    ${STATUS_LABELS[status]}
                  </option>
                `
              )}
            </select>
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleChange}>変更</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.popup.open();
    // 次のレンダリング後に値を設定
    this.updateComplete.then(() => {
      this.statusSelect.value = this.currentStatus;
    });
  }

  close() {
    this.popup.close();
  }

  private handleChange() {
    const status = this.statusSelect.value as CommentStatus;
    this.onChangeStatus?.(status);
    this.close();
  }

  private handleCancel() {
    this.close();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      select {
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
        cursor: pointer;
      }

      select:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }
    `,
  ];
}
