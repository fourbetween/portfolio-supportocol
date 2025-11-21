import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { Project } from "../../../../model/project";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import "../base";
import type { BasePopupPresenter } from "../base";

@customElement("delete-project-popup-presenter")
export class DeleteProjectPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @property({ type: Object })
  project!: Project;

  @state()
  private isDeleteButtonDisabled = true;

  open() {
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.isDeleteButtonDisabled = input.value !== this.project.name;
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">プロジェクトを削除しますか？</span>
        <div slot="main">
          <div class="warning-text">
            この操作は取り消せません。プロジェクト「
            <strong>${this.project.name}</strong>
            」とそれに関連する設定が削除されます。
            <br />
            <span class="danger-text">
              注意:
              紐づいている議論は削除されませんが、このプロジェクトとの関連付けは解除されます。
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">
              確認のため、プロジェクト名を入力してください
            </label>
            <input
              type="text"
              class="form-control"
              @input=${this.handleInput}
            />
          </div>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this.close}>キャンセル</button>
          <button
            class="btn btn-danger"
            ?disabled=${this.isDeleteButtonDisabled}
          >
            削除する
          </button>
        </div>
      </base-popup-presenter>
    `;
  }

  static styles = [
    buttonStyle,
    formStyle,
    css`
      .warning-text {
        margin-bottom: 16px;
      }
      .danger-text {
        color: var(--color-danger-fg);
        font-weight: 600;
      }
    `,
  ];
}
