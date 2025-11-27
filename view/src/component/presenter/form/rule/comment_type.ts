import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../style/base";
import { formStyle } from "../../../../style/form";

export interface CommentTypeFormData {
  name: string;
  description: string;
  color: string;
}

@customElement("comment-type-form-presenter")
export class CommentTypeFormPresenter extends LitElement {
  static readonly COLORS = [
    "#0969da",
    "#d29922",
    "#1a7f37",
    "#cf222e",
    "#8250df",
    "#6e7781",
  ];

  @property({ type: String })
  name = "";

  @property({ type: String })
  description = "";

  @property({ type: Number })
  selectedColorIndex = 0;

  render() {
    return html`
      <div class="form-group">
        <label for="name" class="form-label">名前</label>
        <input
          type="text"
          id="name"
          class="form-control"
          placeholder="例: 補足情報"
          .value="${this.name}"
          @input="${this.handleNameInput}"
        />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">説明</label>
        <textarea
          id="description"
          class="form-control"
          placeholder="このコメント種類の用途を説明してください"
          .value="${this.description}"
          @input="${this.handleDescriptionInput}"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">色</label>
        <div class="color-picker">
          ${CommentTypeFormPresenter.COLORS.map(
            (color, index) => html`
              <button
                type="button"
                class="color-option ${this.selectedColorIndex === index
                  ? "selected"
                  : ""}"
                style="background-color: ${color}"
                aria-label="${color}"
                @click=${() => this.handleColorSelect(index)}
              ></button>
            `
          )}
        </div>
      </div>
    `;
  }

  private handleNameInput(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
    this.dispatchChangeEvent();
  }

  private handleDescriptionInput(e: Event) {
    this.description = (e.target as HTMLTextAreaElement).value;
    this.dispatchChangeEvent();
  }

  private handleColorSelect(index: number) {
    this.selectedColorIndex = index;
    this.dispatchChangeEvent();
  }

  private dispatchChangeEvent() {
    this.dispatchEvent(
      new CustomEvent("change", {
        bubbles: true,
        composed: true,
        detail: this.getFormData(),
      })
    );
  }

  getFormData(): CommentTypeFormData {
    return {
      name: this.name,
      description: this.description,
      color: CommentTypeFormPresenter.COLORS[this.selectedColorIndex],
    };
  }

  static styles = [baseStyle, formStyle];
}
