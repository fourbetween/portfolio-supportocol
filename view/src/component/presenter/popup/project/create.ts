import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import type { BasePopupPresenter } from "../base";

@customElement("create-project-popup-presenter")
export class CreateProjectPopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  open() {
    this.basePopup.open();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">新規プロジェクト作成</span>
        <form slot="main" id="create-project-form">
          <div class="form-group">
            <label for="name" class="form-label">プロジェクト名</label>
            <input
              type="text"
              id="name"
              class="form-control"
              placeholder="プロジェクト名を入力してください"
              required
            />
          </div>
        </form>
        <button
          slot="footer"
          type="submit"
          form="create-project-form"
          class="btn btn-primary"
        >
          作成する
        </button>
      </base-popup-presenter>
    `;
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
