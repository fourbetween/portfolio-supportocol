import { LitElement, css, html } from "lit";
import { property, query } from "lit/decorators.js";
import { ulid } from "ulid";
import type { Rule } from "../../../model/rule";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { cardStyle } from "../../../style/card";
import { formStyle } from "../../../style/form";
import type { AddCommentTypePopupPresenter } from "../popup/rule/add_comment_type";

export class RuleFormPresenter extends LitElement {
  @property({ type: Object })
  rule: Rule = {
    id: "",
    name: "",
    description: "",
    createdBy: "",
    createdAt: "",
    commentTypes: [],
    commentTypePaths: [],
  };

  @query("add-comment-type-popup-presenter")
  private _addCommentTypePopup!: AddCommentTypePopupPresenter;

  protected renderForm() {
    return html`
      <!-- 基本情報 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">基本情報</h2>
        </div>
        <div class="form-group">
          <label class="form-label" for="rule-name">ルール名</label>
          <input
            id="rule-name"
            type="text"
            class="form-control"
            .value="${this.rule.name}"
            @input="${this._handleNameChange}"
          />
        </div>
        <div class="form-group">
          <label class="form-label">説明</label>
          <textarea
            class="form-control"
            .value="${this.rule.description}"
            @input="${this._handleDescriptionChange}"
          ></textarea>
        </div>
      </div>

      <!-- 構造定義 -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">構造定義 (コメント種類と経路)</h2>
          <button class="btn btn-sm" @click="${this._openAddCommentTypePopup}">
            + コメント種類を追加
          </button>
        </div>

        <p class="helper-text" style="margin-bottom: 16px">
          各コメント種類に対して、返信として許可するコメント種類（子コメント）を選択してください。
        </p>

        ${this.rule.commentTypes.map(
          (parentType) => html`
            <div class="card">
              <div
                class="card-header"
                style="border-left: 4px solid ${parentType.color}"
              >
                <div class="comment-type-title">
                  <span
                    class="color-dot"
                    style="background-color: ${parentType.color}"
                  ></span>
                  ${parentType.name}
                </div>
                <button class="btn-danger-text">削除</button>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label class="form-label">
                    このコメントへの返信として許可するもの
                  </label>
                  <div class="checkbox-grid">
                    ${this.rule.commentTypes.map((childType) => {
                      const isChecked = this.rule.commentTypePaths.some(
                        (path) =>
                          path.fromCommentTypeId === parentType.id &&
                          path.toCommentTypeId === childType.id
                      );
                      return html`
                        <label class="checkbox-item">
                          <input
                            type="checkbox"
                            .checked="${isChecked}"
                            @change="${(e: Event) =>
                              this._handlePathChange(
                                e,
                                parentType.id,
                                childType.id
                              )}"
                          />
                          ${childType.name}
                        </label>
                      `;
                    })}
                  </div>
                </div>
              </div>
            </div>
          `
        )}
      </div>

      <add-comment-type-popup-presenter
        @add="${this._handleAddCommentType}"
      ></add-comment-type-popup-presenter>
    `;
  }

  private _openAddCommentTypePopup(e: Event) {
    e.preventDefault();
    this._addCommentTypePopup.open();
  }

  private _handleAddCommentType(e: CustomEvent) {
    const { name, description, color } = e.detail;
    const newType = {
      id: ulid(),
      ruleId: this.rule.id,
      name,
      description,
      color,
    };
    this.rule = {
      ...this.rule,
      commentTypes: [...this.rule.commentTypes, newType],
    };
  }

  private _handleNameChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.rule = { ...this.rule, name: target.value };
  }

  private _handleDescriptionChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.rule = { ...this.rule, description: target.value };
  }

  protected _handlePathChange(e: Event, fromId: string, toId: string) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.rule = {
        ...this.rule,
        commentTypePaths: [
          ...this.rule.commentTypePaths,
          {
            id: ulid(),
            ruleId: this.rule.id,
            fromCommentTypeId: fromId,
            toCommentTypeId: toId,
          },
        ],
      };
    } else {
      this.rule = {
        ...this.rule,
        commentTypePaths: this.rule.commentTypePaths.filter(
          (path) =>
            !(
              path.fromCommentTypeId === fromId && path.toCommentTypeId === toId
            )
        ),
      };
    }
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    cardStyle,
    css`
      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
      }

      /* Header */
      .page-header {
        margin-bottom: 24px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }

      .header-description {
        color: var(--color-fg-muted);
        font-size: 14px;
        margin-top: 4px;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }

      /* Cards & Sections */
      .section {
        background-color: var(--color-canvas-default);
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        padding: 24px;
        margin-bottom: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--color-border-muted);
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }

      /* Comment Type Card */
      .card {
        overflow: hidden;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .comment-type-title {
        font-weight: 600;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .color-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
      }

      .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 8px;
        margin-top: 8px;
        padding: 12px;
        background-color: var(--color-canvas-subtle);
        border-radius: 6px;
        border: 1px solid var(--color-border-muted);
      }

      .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        cursor: pointer;
      }

      .checkbox-item input[type="checkbox"] {
        margin: 0;
      }

      .helper-text {
        font-size: 12px;
        color: var(--color-fg-muted);
        margin-top: 4px;
      }

      .btn-danger-text {
        color: var(--color-danger-fg);
        border: none;
        background: none;
        padding: 4px 8px;
        cursor: pointer;
      }
      .btn-danger-text:hover {
        background-color: #ffebe9;
        text-decoration: underline;
        border-radius: 4px;
      }
    `,
  ];
}
