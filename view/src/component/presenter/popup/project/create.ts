import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";

@customElement("create-project-popup-presenter")
export class CreateProjectPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private popup!: HTMLElement & { open: () => void; close: () => void };

  @query("#project-name")
  private nameInput!: HTMLInputElement;

  @property({ attribute: false })
  onCreate?: (name: string) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">新規プロジェクト</span>
        <div slot="main">
          <div class="form-group">
            <label for="project-name">プロジェクト名</label>
            <input
              type="text"
              id="project-name"
              placeholder="プロジェクト名を入力"
            />
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleCreate}>作成</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.popup.open();
  }

  close() {
    this.popup.close();
  }

  private handleCreate() {
    const name = this.nameInput.value.trim();
    if (name) {
      this.onCreate?.(name);
    }
  }

  private handleCancel() {
    this.onCancel?.();
    this.close();
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
