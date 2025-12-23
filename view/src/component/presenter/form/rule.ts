import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { v7 } from "uuid";
import type { Rule } from "../../../model/rule";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import { formStyle } from "../../../style/form";
import type { AddCommentTypePopupPresenter } from "../popup/rule/add_comment_type";
import type { EditCommentTypePopupPresenter } from "../popup/rule/edit_comment_type";

@customElement("rule-form-presenter")
export class RuleFormPresenter extends LitElement {
  @property({ attribute: false })
  rule: Rule = {
    id: "",
    name: "",
    description: "",
    createdBy: "",
    createdAt: "",
    commentTypes: [],
    commentTypePaths: [],
  };

  @property({ attribute: false })
  onRuleChange?: (rule: Rule) => void;

  @query("add-comment-type-popup-presenter")
  private addCommentTypePopup!: AddCommentTypePopupPresenter;

  @query("edit-comment-type-popup-presenter")
  private editCommentTypePopup!: EditCommentTypePopupPresenter;

  render() {
    return html`
      <div class="form-group">
        <label for="name">ルール名</label>
        <input
          type="text"
          id="name"
          name="name"
          .value=${this.rule.name}
          @input=${this.handleNameChange}
        />
      </div>
      <div class="form-group">
        <label for="description">説明</label>
        <textarea
          id="description"
          name="description"
          rows="4"
          .value=${this.rule.description}
          @input=${this.handleDescriptionChange}
        ></textarea>
      </div>
      <section class="section">
        <div class="section-header">
          <h2 class="section-title">コメント種類</h2>
          <button
            type="button"
            class="btn-secondary"
            @click=${this.handleAddCommentType}
          >
            + コメント種類を追加
          </button>
        </div>
        <ul class="comment-type-list">
          ${this.rule.commentTypes.map(
            (type, index) => html`
              <li class="comment-type-item">
                <span
                  class="color-badge"
                  style="background-color: ${type.color}"
                ></span>
                <span class="comment-type-name">${type.name}</span>
                <label class="root-comment-label">
                  <input
                    type="checkbox"
                    aria-label="${type.name} をルートコメントとして設定"
                    .checked=${this.isRootCommentType(type.id)}
                    @change=${(e: Event) =>
                      this.handleRootCommentChange(e, type.id)}
                  />
                  ルートコメント
                </label>
                <div class="comment-type-actions">
                  <button
                    type="button"
                    class="btn-icon"
                    aria-label="上へ移動"
                    ?disabled=${index === 0}
                    @click=${() => this.handleMoveUp(index)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn-icon"
                    aria-label="下へ移動"
                    ?disabled=${index === this.rule.commentTypes.length - 1}
                    @click=${() => this.handleMoveDown(index)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="btn-text"
                    @click=${() => this.handleEditCommentType(type.id)}
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    class="btn-text btn-danger"
                    @click=${() => this.handleDeleteCommentType(type.id)}
                  >
                    削除
                  </button>
                </div>
              </li>
            `
          )}
        </ul>
      </section>
      <section class="section">
        <h2 class="section-title">経路設定</h2>
        <div class="path-matrix">
          ${this.rule.commentTypes.map(
            (fromType) => html`
              <div class="path-row">
                <span class="path-from-label">${fromType.name} に対して</span>
                <div class="path-checkboxes">
                  ${this.rule.commentTypes.map((toType) => {
                    const isChecked = this.rule.commentTypePaths.some(
                      (path) =>
                        path.childCommentTypeId === fromType.id &&
                        path.parentCommentTypeId === toType.id
                    );
                    const checkboxId = `path-${fromType.id}-${toType.id}`;
                    return html`
                      <label class="path-checkbox-label">
                        <input
                          type="checkbox"
                          id=${checkboxId}
                          .checked=${isChecked}
                          aria-label="${fromType.name} → ${toType.name}"
                          @change=${(e: Event) =>
                            this.handlePathChange(e, fromType.id, toType.id)}
                        />
                        <span class="path-to-name">${toType.name}</span>
                      </label>
                    `;
                  })}
                </div>
              </div>
            `
          )}
        </div>
      </section>
      <add-comment-type-popup-presenter
        @add=${this.handleAddCommentTypeSubmit}
      ></add-comment-type-popup-presenter>
      <edit-comment-type-popup-presenter
        @update=${this.handleEditCommentTypeSubmit}
      ></edit-comment-type-popup-presenter>
    `;
  }

  private updateRule(newRule: Rule) {
    this.rule = newRule;
    this.onRuleChange?.(newRule);
  }

  private handleAddCommentType() {
    this.addCommentTypePopup.open();
  }

  private handleAddCommentTypeSubmit(e: CustomEvent) {
    const { name, description, color } = e.detail;
    const newId = v7();
    const maxNo = this.rule.commentTypes.reduce(
      (max, type) => Math.max(max, type.no),
      -1
    );
    const newType = {
      id: newId,
      no: maxNo + 1,
      name,
      description,
      color,
      root: false,
    };
    this.updateRule({
      ...this.rule,
      commentTypes: [...this.rule.commentTypes, newType],
    });
  }

  private handleEditCommentType(id: string) {
    const commentType = this.rule.commentTypes.find((type) => type.id === id);
    if (commentType) {
      this.editCommentTypePopup.open(commentType);
    }
  }

  private handleEditCommentTypeSubmit(e: CustomEvent) {
    const { id, name, description, color } = e.detail;
    this.updateRule({
      ...this.rule,
      commentTypes: this.rule.commentTypes.map((type) =>
        type.id === id ? { ...type, name, description, color } : type
      ),
    });
  }

  private handleDeleteCommentType(id: string) {
    this.updateRule({
      ...this.rule,
      commentTypes: this.rule.commentTypes.filter((type) => type.id !== id),
      commentTypePaths: this.rule.commentTypePaths.filter(
        (path) =>
          path.childCommentTypeId !== id && path.parentCommentTypeId !== id
      ),
    });
  }

  private handleMoveUp(index: number) {
    if (index <= 0) return;
    const newCommentTypes = [...this.rule.commentTypes];
    const temp = newCommentTypes[index];
    newCommentTypes[index] = newCommentTypes[index - 1];
    newCommentTypes[index - 1] = temp;
    this.updateRule({
      ...this.rule,
      commentTypes: newCommentTypes,
    });
  }

  private handleMoveDown(index: number) {
    if (index >= this.rule.commentTypes.length - 1) return;
    const newCommentTypes = [...this.rule.commentTypes];
    const temp = newCommentTypes[index];
    newCommentTypes[index] = newCommentTypes[index + 1];
    newCommentTypes[index + 1] = temp;
    this.updateRule({
      ...this.rule,
      commentTypes: newCommentTypes,
    });
  }

  private handleNameChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.updateRule({ ...this.rule, name: target.value });
  }

  private handleDescriptionChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.updateRule({ ...this.rule, description: target.value });
  }

  private handlePathChange(e: Event, fromId: string, toId: string) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.updateRule({
        ...this.rule,
        commentTypePaths: [
          ...this.rule.commentTypePaths,
          { childCommentTypeId: fromId, parentCommentTypeId: toId },
        ],
      });
    } else {
      this.updateRule({
        ...this.rule,
        commentTypePaths: this.rule.commentTypePaths.filter(
          (path) =>
            !(
              path.childCommentTypeId === fromId &&
              path.parentCommentTypeId === toId
            )
        ),
      });
    }
  }

  private isRootCommentType(typeId: string): boolean {
    const commentType = this.rule.commentTypes.find((ct) => ct.id === typeId);
    return commentType?.root ?? false;
  }

  private handleRootCommentChange(e: Event, typeId: string) {
    const checked = (e.target as HTMLInputElement).checked;
    this.updateRule({
      ...this.rule,
      commentTypes: this.rule.commentTypes.map((ct) =>
        ct.id === typeId ? { ...ct, root: checked } : ct
      ),
    });
  }

  static styles = [
    baseStyle,
    buttonStyle,
    formStyle,
    css`
      .section {
        margin-top: 24px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-fg-default);
        margin: 0 0 16px 0;
      }

      .comment-type-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .comment-type-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
      }

      .color-badge {
        width: 16px;
        height: 16px;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .comment-type-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-fg-default);
        flex-grow: 1;
      }

      .root-comment-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: var(--color-fg-muted);
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        background-color: var(--color-canvas-subtle);
        white-space: nowrap;
      }

      .root-comment-label:hover {
        background-color: var(--color-canvas-inset);
      }

      .root-comment-label input[type="checkbox"] {
        width: 14px;
        height: 14px;
        cursor: pointer;
      }

      .comment-type-actions {
        display: flex;
        gap: 8px;
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        background: none;
        border: 1px solid var(--color-border-default);
        border-radius: 4px;
        color: var(--color-fg-muted);
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      .btn-icon:hover:not(:disabled) {
        background-color: var(--color-canvas-subtle);
        color: var(--color-fg-default);
      }

      .btn-icon:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .btn-text {
        background: none;
        border: none;
        color: var(--color-accent-fg);
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
      }

      .btn-text:hover {
        text-decoration: underline;
      }

      .btn-danger {
        color: var(--color-danger-fg);
      }

      .path-matrix {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .path-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-subtle);
      }

      .path-from-label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      .path-checkboxes {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .path-checkbox-label {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--color-fg-default);
        cursor: pointer;
      }

      .path-checkbox-label input[type="checkbox"] {
        width: 16px;
        height: 16px;
        cursor: pointer;
      }

      .path-to-name {
        font-size: 14px;
      }
    `,
  ];
}
