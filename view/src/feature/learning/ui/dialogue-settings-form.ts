import { msg } from "@lit/localize";
import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { inputStyle } from "../../../shared/style/input";
import type { CommentFrame } from "../model/comment-frame";
import type { DialogueSettings } from "../model/discussion";
import "./comment-frame-form";
import type { LearningCommentFrameForm } from "./comment-frame-form";

@customElement("learning-dialogue-settings-form")
export class LearningDialogueSettingsForm extends LitElement {
  @property({ type: Object })
  initialSettings?: DialogueSettings | null;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @state()
  private _commentPermission: DialogueSettings["commentPermission"] =
    "everyone";

  @state()
  private _issuePermission: DialogueSettings["issuePermission"] = "everyone";

  @query("learning-comment-frame-form")
  private _commentFrameForm!: LearningCommentFrameForm;

  get value(): DialogueSettings {
    return {
      commentFrame: this._commentFrameForm.value,
      commentPermission: this._commentPermission,
      issuePermission: this._issuePermission,
    };
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("initialSettings")) {
      if (this.initialSettings) {
        this._commentPermission = this.initialSettings.commentPermission;
        this._issuePermission = this.initialSettings.issuePermission;
      } else {
        this._commentPermission = "everyone";
        this._issuePermission = "everyone";
      }
    }
  }

  render() {
    return html`
      <div class="container">
        <section aria-label=${msg("Permissions")}>
          <div class="section-title">${msg("Permissions")}</div>
          <div class="permission-grid">
            <div class="permission-field">
              <label for="comment-permission">${msg("Comments")}</label>
              <select
                id="comment-permission"
                .value=${this._commentPermission}
                @change=${(e: Event) =>
                  (this._commentPermission = (e.target as HTMLSelectElement)
                    .value as any)}
              >
                <option value="everyone">${msg("Everyone")}</option>
                <option value="authenticated">${msg("Authenticated")}</option>
                <option value="none">${msg("None")}</option>
              </select>
            </div>
            <div class="permission-field">
              <label for="issue-permission">${msg("Issues")}</label>
              <select
                id="issue-permission"
                .value=${this._issuePermission}
                @change=${(e: Event) =>
                  (this._issuePermission = (e.target as HTMLSelectElement)
                    .value as any)}
              >
                <option value="everyone">${msg("Everyone")}</option>
                <option value="authenticated">${msg("Authenticated")}</option>
                <option value="none">${msg("None")}</option>
              </select>
            </div>
          </div>
        </section>
        <learning-comment-frame-form
          .initialFrame=${this.initialSettings?.commentFrame}
          .usedFrame=${this.usedFrame}
        ></learning-comment-frame-form>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    inputStyle,
    css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .permission-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 24px;
      }
      .permission-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .permission-field label {
        font-size: 12px;
        font-weight: bold;
        color: var(--color-fg-muted);
      }
      select {
        flex: 1;
      }
    `,
  ];
}
