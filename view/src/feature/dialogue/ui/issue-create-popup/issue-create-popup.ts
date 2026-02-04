import { LitElement, css, html, nothing, type PropertyValues } from "lit";
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

const TEMPLATES = [
  {
    title: "Circular Reasoning",
    description: "The conclusion is included in the premise of the argument.",
  },
  {
    title: "Ad Hominem",
    description:
      "Attacking the person making the argument rather than the argument itself.",
  },
  {
    title: "Straw Man",
    description:
      "Misrepresenting someone's argument to make it easier to attack.",
  },
  {
    title: "Red Herring",
    description:
      "Introducing an irrelevant topic to divert attention from the original issue.",
  },
];

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

  @query("select")
  private _templateSelect!: HTMLSelectElement;

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has("open") && this.open) {
      if (this._titleInput) this._titleInput.value = "";
      if (this._descriptionInput) this._descriptionInput.value = "";
      if (this._templateSelect) this._templateSelect.value = "";
    }
  }

  private _handleTemplateChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const index = parseInt(select.value);
    if (!isNaN(index)) {
      const template = TEMPLATES[index];
      this._titleInput.value = template.title;
      this._descriptionInput.value = template.description;
    }
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();
    const title = this._titleInput.value.trim();
    const description = this._descriptionInput.value.trim();

    if (title) {
      this.dispatchEvent(new DialogueIssueCreateEvent(title, description));
      this._titleInput.value = "";
      this._descriptionInput.value = "";
      this._templateSelect.value = "";
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
                <select @change=${this._handleTemplateChange}>
                  <option value="" selected disabled>
                    Use Template (optional)
                  </option>
                  ${TEMPLATES.map(
                    (t, i) => html`
                      <option value=${i}>${t.title}</option>
                    `,
                  )}
                </select>
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
