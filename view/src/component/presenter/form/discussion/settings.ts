import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import { layoutStyle } from "../../../../style/layout";

@customElement("settings-discussion-form-presenter")
export class SettingsDiscussionFormPresenter extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  protected render() {
    return html`
      <div class="container">
        <div class="page-header">
          <h1>議論設定</h1>
        </div>

        <form>
          <div class="section">
            <h2 class="section-title">基本設定</h2>

            <div class="form-group">
              <label class="form-label" for="theme">テーマ</label>
              <input
                type="text"
                id="theme"
                name="theme"
                class="form-control"
                .value=${this.discussion?.theme ?? ""}
                required
              />
              <p class="form-helper">
                議論の中心となる問いや議題を簡潔に入力してください。
              </p>
            </div>

            <div class="form-group">
              <label class="form-label" for="background">背景</label>
              <textarea
                id="background"
                name="background"
                class="form-control"
                .value=${this.discussion?.background ?? ""}
              ></textarea>
              <p class="form-helper">
                なぜこの議論が必要なのか、前提となる知識や状況を共有しましょう。
              </p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">変更を保存</button>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">アクセス設定</h2>

            <div class="form-group">
              <label class="form-label" for="visibilityLevel">公開レベル</label>
              <select
                id="visibilityLevel"
                name="visibilityLevel"
                class="form-control"
                required
              >
                <option
                  value="everyone"
                  ?selected=${this.discussion?.visibilityLevel === "everyone"}
                >
                  全員
                </option>
                <option
                  value="authenticated"
                  ?selected=${this.discussion?.visibilityLevel ===
                  "authenticated"}
                >
                  ログインユーザー
                </option>
                <option
                  value="owner"
                  ?selected=${this.discussion?.visibilityLevel === "owner"}
                >
                  自分のみ
                </option>
              </select>
              <p class="form-helper">この議論を閲覧できる範囲を設定します。</p>
            </div>

            <div class="form-group">
              <label class="form-label" for="commentPermissionLevel">
                コメント許可レベル
              </label>
              <select
                id="commentPermissionLevel"
                name="commentPermissionLevel"
                class="form-control"
                required
              >
                <option
                  value="everyone"
                  ?selected=${this.discussion?.commentPermissionLevel ===
                  "everyone"}
                >
                  全員
                </option>
                <option
                  value="authenticated"
                  ?selected=${this.discussion?.commentPermissionLevel ===
                  "authenticated"}
                >
                  ログインユーザー
                </option>
                <option
                  value="owner"
                  ?selected=${this.discussion?.commentPermissionLevel ===
                  "owner"}
                >
                  自分のみ
                </option>
              </select>
              <p class="form-helper">
                この議論にコメントできる範囲を設定します。
              </p>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">変更を保存</button>
            </div>
          </div>
        </form>

        <div class="danger-zone">
          <h2>Danger Zone</h2>

          <div class="danger-item">
            <div class="danger-item-content">
              <h4>議論をアーカイブする</h4>
              <p>この議論を読み取り専用にします。</p>
            </div>
            <button type="button" class="btn btn-danger">アーカイブ</button>
          </div>

          <div class="danger-item">
            <div class="danger-item-content">
              <h4>議論を削除する</h4>
              <p>
                この議論と関連するすべてのコメントを完全に削除します。この操作は取り消せません。
              </p>
            </div>
            <button type="button" class="btn btn-danger">削除</button>
          </div>
        </div>
      </div>
    `;
  }

  static styles = [baseStyle, buttonStyle, formStyle, layoutStyle];
}
