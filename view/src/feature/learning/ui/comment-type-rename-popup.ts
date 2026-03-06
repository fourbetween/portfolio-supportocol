import { msg, str } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { inputStyle } from "../../../shared/style/input";
import "../../../shared/ui/popup/popup";
import { LearningDiscussionRenameCommentTypeEvent } from "../event/discussion";

@customElement("learning-comment-type-rename-popup")
export class LearningCommentTypeRenamePopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  oldType = "";

  @state()
  private _newType = "";

  @query("input")
  private _input?: HTMLInputElement;

  show(oldType: string) {
    this.oldType = oldType;
    this._newType = oldType;
    this.open = true;
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    if (
      (changedProperties.has("open") || changedProperties.has("oldType")) &&
      this.open
    ) {
      this.updateComplete.then(() => this._input?.focus());
    }
  }

  private _handleInput(e: Event) {
    this._newType = (e.target as HTMLInputElement).value;
  }

  private _handleClose() {
    this.open = false;
  }

  private _handleSave() {
    const newType = this._newType.trim();
    if (!this.oldType || !newType || newType === this.oldType) return;

    this.dispatchEvent(
      new LearningDiscussionRenameCommentTypeEvent(this.oldType, newType),
    );
    this._handleClose();
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">${msg("Rename Comment Type")}</div>
        <div slot="main" class="content">
          <label class="label" for="comment-type-name">
            ${msg(str`Rename "${this.oldType}" to`)}
          </label>
          <input
            id="comment-type-name"
            type="text"
            .value=${this._newType}
            @input=${this._handleInput}
            placeholder=${msg("New type name")}
          />
        </div>
        <div slot="footer" class="footer">
          <button class="btn" @click=${this._handleClose}>
            ${msg("Cancel")}
          </button>
          <button
            class="btn btn-primary"
            @click=${this._handleSave}
            ?disabled=${!this._newType.trim() ||
            this._newType.trim() === this.oldType}
          >
            ${msg("Save")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    css`
      .content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-width: min(100%, 320px);
      }

      .label {
        font-size: 14px;
        color: var(--color-fg-muted);
      }
    `,
  ];
}
