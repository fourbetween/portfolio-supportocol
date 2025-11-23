import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import "../base";
import type { BasePopupPresenter } from "../base";

export interface CreateDiscussionData {
  theme: string;
  background: string;
  ruleId: string;
  visibilityLevel: string;
  commentPermissionLevel: string;
}

@customElement("create-discussion-popup-presenter")
export class CreateDiscussionPopupPresenter extends LitElement {
  @property({ attribute: false })
  onCreate: (data: CreateDiscussionData) => Promise<void> = () =>
    Promise.resolve();

  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  @query("#theme")
  private themeInput!: HTMLInputElement;

  @query("#background")
  private backgroundInput!: HTMLTextAreaElement;

  @query("#ruleId")
  private ruleIdInput!: HTMLSelectElement;

  @query("#visibilityLevel")
  private visibilityLevelInput!: HTMLSelectElement;

  @query("#commentPermissionLevel")
  private commentPermissionLevelInput!: HTMLSelectElement;

  open() {
    this.basePopup.open();
  }

  protected render() {
    return html`
      <base-popup-presenter>
        <span slot="header">議論の新規作成</span>
        <form slot="main" id="create-discussion-form" @submit=${this.submit}>
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
        </form>
        <button
          slot="footer"
          type="submit"
          form="create-discussion-form"
          class="btn btn-primary"
        >
          議論を作成
        </button>
      </base-popup-presenter>
    `;
  }

  private async submit(e: Event) {
    e.preventDefault();
    await this.onCreate({
      theme: this.themeInput.value,
      background: this.backgroundInput.value,
      ruleId: this.ruleIdInput.value,
      visibilityLevel: this.visibilityLevelInput.value,
      commentPermissionLevel: this.commentPermissionLevelInput.value,
    });
    this.themeInput.value = "";
    this.backgroundInput.value = "";
    this.ruleIdInput.value = "";
    this.visibilityLevelInput.value = "everyone";
    this.commentPermissionLevelInput.value = "everyone";
    this.basePopup.close();
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
