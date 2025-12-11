import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import type { BasePopupPresenter } from "../base";

@customElement("edit-project-popup-presenter")
export class EditProjectPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @property({ type: String })
  projectName = "";

  @state()
  private inputValue = "";

  @property({ attribute: false })
  onSave?: (name: string) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  protected willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("projectName")) {
      this.inputValue = this.projectName;
    }
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">プロジェクトを編集</span>
        <div slot="main">
          <div class="form-group">
            <label for="project-name">プロジェクト名</label>
            <input
              type="text"
              id="project-name"
              .value=${this.inputValue}
              @input=${this.handleInput}
              placeholder="プロジェクト名を入力"
            />
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleSave}>保存</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.inputValue = this.projectName;
    this.basePopup.open();
  }

  close() {
    this.basePopup.close();
  }

  private handleInput(e: Event) {
    this.inputValue = (e.target as HTMLInputElement).value;
  }

  private handleSave() {
    const name = this.inputValue.trim();
    if (name) {
      this.onSave?.(name);
    }
  }

  private handleCancel() {
    this.onCancel?.();
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
