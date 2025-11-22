import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import { layoutStyle } from "../../../../style/layout";

@customElement("create-discussion-form-presenter")
export class CreateDiscussionFormPresenter extends LitElement {
  protected render() {
    return html`
      <div class="container">
        <div class="page-header">
          <h1>議論の新規作成</h1>
        </div>

        <form>
          <div class="section">
            <div class="form-group">
              <label class="form-label" for="theme">テーマ</label>
              <input
                type="text"
                id="theme"
                name="theme"
                class="form-control"
                placeholder="議論のテーマを入力してください"
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
                placeholder="議論の背景や前提条件を入力してください"
              ></textarea>
              <p class="form-helper">
                なぜこの議論が必要なのか、前提となる知識や状況を共有しましょう。
              </p>
            </div>

            <div class="form-group">
              <label class="form-label" for="ruleId">ルール</label>
              <select id="ruleId" name="ruleId" class="form-control" required>
                <option value="" disabled selected>
                  ルールを選択してください
                </option>
                <option value="rule1">ディベート標準ルール</option>
                <option value="rule2">ブレインストーミング</option>
                <option value="rule3">意思決定プロセス</option>
              </select>
              <p class="form-helper">
                議論の進行に使用するルールセットを選択します。
              </p>
            </div>

            <div class="form-group">
              <label class="form-label" for="visibilityLevel">公開レベル</label>
              <select
                id="visibilityLevel"
                name="visibilityLevel"
                class="form-control"
                required
              >
                <option value="everyone">全員</option>
                <option value="logged_in">ログインユーザー</option>
                <option value="owner">自分のみ</option>
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
                <option value="everyone">全員</option>
                <option value="logged_in">ログインユーザー</option>
                <option value="owner">自分のみ</option>
              </select>
              <p class="form-helper">
                この議論にコメントできる範囲を設定します。
              </p>
            </div>

            <div class="form-actions">
              <a href="list.html" class="btn">キャンセル</a>
              <button type="submit" class="btn btn-primary">議論を作成</button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  static styles = [baseStyle, buttonStyle, formStyle, layoutStyle];
}
