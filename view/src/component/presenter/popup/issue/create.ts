import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import type { BasePopupPresenter } from "../base";

type IssueType = "contradiction" | "circular_logic";

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  contradiction: "矛盾",
  circular_logic: "循環論法",
};

export interface CreateIssueFormData {
  issueType: IssueType;
  description: string;
}

@customElement("create-issue-popup-presenter")
export class CreateIssuePopupPresenter extends LitElement {
  @query("base-popup-presenter")
  private popup!: BasePopupPresenter;

  @query("#issue-type")
  private typeSelect!: HTMLSelectElement;

  @query("#issue-description")
  private descriptionTextarea!: HTMLTextAreaElement;

  @property({ attribute: false })
  onCreate?: (data: CreateIssueFormData) => void;

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">指摘を作成</span>
        <div slot="main">
          <div class="form-group">
            <label for="issue-type">指摘種類</label>
            <select id="issue-type">
              <option value="">選択してください</option>
              ${(Object.keys(ISSUE_TYPE_LABELS) as IssueType[]).map(
                (type) => html`
                  <option value="${type}">${ISSUE_TYPE_LABELS[type]}</option>
                `
              )}
            </select>
          </div>
          <div class="form-group">
            <label for="issue-description">説明</label>
            <textarea
              id="issue-description"
              placeholder="指摘の説明を入力"
              rows="5"
            ></textarea>
          </div>
        </div>
        <div slot="footer">
          <button class="btn-secondary" @click=${this.handleCancel}>
            キャンセル
          </button>
          <button class="btn-primary" @click=${this.handleCreate}>作成</button>
        </div>
      </base-popup-presenter>
    `;
  }

  open() {
    this.typeSelect.value = "";
    this.descriptionTextarea.value = "";
    this.popup.open();
  }

  close() {
    this.popup.close();
  }

  private handleCreate() {
    const issueType = this.typeSelect.value as IssueType;
    const description = this.descriptionTextarea.value.trim();

    if (!issueType || !description) {
      return;
    }

    this.onCreate?.({ issueType, description });
    this.close();
  }

  private handleCancel() {
    this.close();
  }

  static styles = [baseStyle, buttonStyle, formStyle];
}
