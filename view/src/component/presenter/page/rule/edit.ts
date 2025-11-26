import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Rule } from "../../../../model/rule";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";

@customElement("edit-rule-page-presenter")
export class EditRulePagePresenter extends LitElement {
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
  onSave?: (rule: Rule) => void;

  @property({ attribute: false })
  onCancel?: () => void;

  render() {
    return html`
      <main class="container">
        <h1>ルール編集</h1>
        <form>
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
            <h2 class="section-title">コメント種類</h2>
            <ul class="comment-type-list">
              ${this.rule.commentTypes.map(
                (type) => html`
                  <li class="comment-type-item">
                    <span
                      class="color-badge"
                      style="background-color: ${type.color}"
                    ></span>
                    <span class="comment-type-name">${type.name}</span>
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
                    <span class="path-from-label">${fromType.name} →</span>
                    <div class="path-checkboxes">
                      ${this.rule.commentTypes.map((toType) => {
                        const isChecked = this.rule.commentTypePaths.some(
                          (path) =>
                            path.fromCommentTypeId === fromType.id &&
                            path.toCommentTypeId === toType.id
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
                                this.handlePathChange(
                                  e,
                                  fromType.id,
                                  toType.id
                                )}
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
          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              @click=${this.handleCancel}
            >
              キャンセル
            </button>
            <button type="button" class="btn-primary" @click=${this.handleSave}>
              保存
            </button>
          </div>
        </form>
      </main>
    `;
  }

  private handleSave() {
    this.onSave?.(this.rule);
  }

  private handleCancel() {
    this.onCancel?.();
  }

  private handleNameChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.rule = { ...this.rule, name: target.value };
  }

  private handleDescriptionChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    this.rule = { ...this.rule, description: target.value };
  }

  private handlePathChange(e: Event, fromId: string, toId: string) {
    const checked = (e.target as HTMLInputElement).checked;
    if (checked) {
      this.rule = {
        ...this.rule,
        commentTypePaths: [
          ...this.rule.commentTypePaths,
          { fromCommentTypeId: fromId, toCommentTypeId: toId },
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
    css`
      :host {
        display: block;
        min-height: 100vh;
        background-color: var(--color-canvas-default);
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 24px;
      }

      h1 {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-fg-default);
        margin: 0 0 24px 0;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      label {
        font-size: 14px;
        font-weight: 600;
        color: var(--color-fg-default);
      }

      input[type="text"],
      textarea {
        padding: 8px 12px;
        font-size: 14px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }

      input[type="text"]:focus,
      textarea:focus {
        outline: none;
        border-color: var(--color-accent-fg);
        box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.3);
      }

      textarea {
        resize: vertical;
      }

      .section {
        margin-top: 24px;
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

      .form-actions {
        margin-top: 24px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
    `,
  ];
}
