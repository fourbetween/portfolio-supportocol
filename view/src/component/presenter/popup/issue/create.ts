import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import { BasePopupPresenter } from "../base";

@customElement("create-issue-popup-presenter")
export class CreateIssuePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  open() {
    this.basePopup.open();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">指摘作成</span>
        <div slot="main">
          <p>選択したコメントに対する論理的な問題を指摘します。</p>
          <form>
            <div class="form-group">
              <label for="type" class="form-label">指摘の種類</label>
              <select id="type" class="form-control">
                <option value="contradiction">矛盾</option>
                <option value="circular_logic">循環論法</option>
              </select>
            </div>
            <div class="form-group">
              <label for="description" class="form-label">説明</label>
              <textarea
                id="description"
                class="form-control"
                placeholder="問題点を具体的に説明してください..."
              ></textarea>
            </div>
          </form>
        </div>
        <div slot="footer">
          <button type="submit" class="btn btn-primary">指摘する</button>
        </div>
      </base-popup-presenter>
    `;
  }

  static styles = [
    baseStyle,
    formStyle,
    buttonStyle,
    css`
      p {
        margin-bottom: 16px;
      }
    `,
  ];
}
