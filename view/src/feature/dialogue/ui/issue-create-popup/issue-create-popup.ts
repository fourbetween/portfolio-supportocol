import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import { formStyle } from "../../../../shared/style/form";
import { iconStyle } from "../../../../shared/style/icon";
import { inputStyle } from "../../../../shared/style/input";
import { titleStyle } from "../../../../shared/style/title";
import "../../../../shared/ui/popup/popup";
import { DialogueIssueCreateEvent } from "../../event/issue";
import type { Comment } from "../../model/comment";
import "../comment-context/comment-context";

@customElement("dialogue-issue-create-popup")
export class DialogueIssueCreatePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  path: Comment[] = [];

  @query("#title")
  private _titleInput!: HTMLInputElement;

  @query("#description")
  private _descriptionInput!: HTMLTextAreaElement;

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const title = this._titleInput.value.trim();
    const description = this._descriptionInput.value.trim();

    if (title) {
      this.dispatchEvent(new DialogueIssueCreateEvent(title, description));
      this._titleInput.value = "";
      this._descriptionInput.value = "";
      this.open = false;
    }
  }

  render() {
    return html`
      <ui-popup .open=${this.open}>
        <div slot="header">Add Issue</div>
        <div slot="main">
          <div class="container">
            ${this.renderContextSection()}
            <div class="section">
              <div class="section-title">Issue Details</div>
              <form @submit=${this._handleSubmit}>
                <input
                  type="text"
                  id="title"
                  required
                  placeholder="Issue title..."
                />
                <textarea
                  id="description"
                  placeholder="Issue description..."
                ></textarea>
              </form>
            </div>
          </div>
        </div>
        <div slot="footer">
          <button type="button" class="btn close">Cancel</button>
          <button
            form="issue-form"
            class="btn btn-primary"
            @click=${this._handleSubmit}
          >
            Add Issue
          </button>
        </div>
      </ui-popup>
    `;
  }

  private renderContextSection() {
    if (this.path.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-title">Target Comment Context</div>
        <dialogue-comment-context
          .path=${this.path}
          .readonly=${true}
        ></dialogue-comment-context>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    titleStyle,
    inputStyle,
    formStyle,
    css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        min-width: 400px;
        max-width: 600px;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      textarea {
        min-height: 100px;
        resize: vertical;
      }
    `,
  ];
}
