import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { buttonStyle } from "../../../../shared/style/button";
import "../../../../shared/ui/popup";
import type { Popup } from "../../../../shared/ui/popup";

@customElement("learning-comment-type-popup")
export class LearningCommentTypePopup extends LitElement {
  @property({ type: Array })
  types: string[] = [];

  @property({ attribute: false })
  onSelect: (type: string) => void = () => {};

  @state()
  private isOtherSelected = false;

  @state()
  private otherValue = "";

  @query("ui-popup")
  private popup!: Popup;

  open() {
    this.isOtherSelected = false;
    this.otherValue = "";
    this.popup.open();
  }

  close() {
    this.popup.close();
  }

  private handleSelect(type: string) {
    this.onSelect(type);
    this.close();
  }

  private handleOtherClick() {
    this.isOtherSelected = true;
  }

  private handleOtherSubmit() {
    if (this.otherValue.trim()) {
      this.onSelect(this.otherValue.trim());
      this.close();
    }
  }

  render() {
    return html`
      <ui-popup>
        <span slot="header">
          ${this.isOtherSelected ? "Enter Custom Type" : "Select Comment Type"}
        </span>
        <div slot="main" class="type-list">
          ${this.isOtherSelected
            ? html`
                <div class="other-form">
                  <input
                    type="text"
                    class="other-input form-control"
                    .value=${this.otherValue}
                    @input=${(e: Event) =>
                      (this.otherValue = (e.target as HTMLInputElement).value)}
                    placeholder="Type here..."
                    @keydown=${(e: KeyboardEvent) =>
                      e.key === "Enter" && this.handleOtherSubmit()}
                  />
                  <div class="other-actions">
                    <button
                      class="btn"
                      @click=${() => (this.isOtherSelected = false)}
                    >
                      Back
                    </button>
                    <button
                      class="other-submit btn btn-primary"
                      @click=${this.handleOtherSubmit}
                      ?disabled=${!this.otherValue.trim()}
                    >
                      OK
                    </button>
                  </div>
                </div>
              `
            : html`
                ${this.types.map(
                  (type) => html`
                    <button
                      class="type-button btn btn-block"
                      @click=${() => this.handleSelect(type)}
                    >
                      ${type}
                    </button>
                  `
                )}
                <button
                  class="other-button btn btn-block btn-outline"
                  @click=${this.handleOtherClick}
                >
                  Other...
                </button>
              `}
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .type-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .type-button,
      .other-button {
        text-align: left;
        justify-content: flex-start;
      }
      .other-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .other-input {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        background-color: var(--color-canvas-default);
        color: var(--color-fg-default);
      }
      .other-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ];
}
