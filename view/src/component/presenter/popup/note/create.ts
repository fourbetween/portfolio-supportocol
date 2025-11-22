import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import "../base";
import type { BasePopupPresenter } from "../base";

@customElement("create-note-popup-presenter")
export class CreateNotePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  open() {
    this.basePopup.open();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">ノート作成</span>
        <form slot="main" id="create-note-form">
          <div class="form-group">
            <label for="content" class="form-label">内容</label>
            <textarea
              id="content"
              class="form-control"
              placeholder="メモを入力してください..."
              style="height: 150px;"
            ></textarea>
          </div>
        </form>
        <button
          slot="footer"
          type="submit"
          form="create-note-form"
          class="btn btn-primary"
        >
          保存する
        </button>
      </base-popup-presenter>
    `;
  }

  static styles = [buttonStyle, formStyle];
}
