import { msg, str } from "@lit/localize";
import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { commentFrameDetail } from "../../../shared/style/comment-frame-detail";
import { inputStyle } from "../../../shared/style/input";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import "../../../shared/ui/icons/icon-add";
import "../../../shared/ui/icons/icon-arrow-back";
import "../../../shared/ui/icons/icon-delete";
import type { CommentFrame } from "../model/comment-frame";
import type { DialogueSettings } from "../model/discussion";

@customElement("learning-dialogue-settings-form")
export class LearningDialogueSettingsForm extends LitElement {
  @property({ type: Object })
  initialSettings?: DialogueSettings | null;

  @property({ type: Object })
  usedFrame?: CommentFrame;

  @state()
  private _types: string[] = [];

  @state()
  private _paths: { child: string; parent: string }[] = [];

  @state()
  private _newTypeName: string = "";

  @state()
  private _selectedParent: string = "";

  @state()
  private _selectedChild: string = "";

  @state()
  private _commentPermission: DialogueSettings["commentPermission"] =
    "authenticated";

  @state()
  private _issuePermission: DialogueSettings["issuePermission"] =
    "authenticated";

  get value(): DialogueSettings {
    return {
      commentFrame: {
        types: [...this._types],
        paths: [...this._paths],
      },
      commentPermission: this._commentPermission,
      issuePermission: this._issuePermission,
    };
  }

  private _usedTypes: Set<string> = new Set();

  private _usedPaths: Set<string> = new Set();

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("initialSettings")) {
      if (this.initialSettings) {
        this._types = [...this.initialSettings.commentFrame.types];
        this._paths = [...this.initialSettings.commentFrame.paths];
        this._commentPermission = this.initialSettings.commentPermission;
        this._issuePermission = this.initialSettings.issuePermission;
      } else {
        this._types = [];
        this._paths = [];
        this._commentPermission = "authenticated";
        this._issuePermission = "authenticated";
      }
      this._newTypeName = "";
      this._selectedParent = "";
      this._selectedChild = "";
    }

    if (changedProperties.has("usedFrame")) {
      if (this.usedFrame) {
        this._usedTypes = new Set(this.usedFrame.types);
        this._usedPaths = new Set(
          this.usedFrame.paths.map((p) => `${p.parent}->${p.child}`),
        );
      } else {
        this._usedTypes = new Set();
        this._usedPaths = new Set();
      }
    }
  }

  private _handleTypeNameInput(e: InputEvent) {
    this._newTypeName = (e.target as HTMLInputElement).value;
  }

  private _handleAddType() {
    const type = this._newTypeName.trim();
    if (!type) return;
    if (this._types.includes(type)) return;

    this._types = [...this._types, type].sort();
    this._newTypeName = "";
  }

  private _handleRemoveType(type: string) {
    this._types = this._types.filter((t) => t !== type);
    // 関連するパスを削除
    this._paths = this._paths.filter(
      (p) => p.child !== type && p.parent !== type,
    );
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
        <section aria-label=${msg("Types")}>
          <div class="section-title">${msg("Types")}</div>
          <div class="types-form">
            <input
              type="text"
              placeholder=${msg("New type...")}
              .value=${this._newTypeName}
              @input=${this._handleTypeNameInput}
            />
            <button
              class="btn btn-primary"
              aria-label=${msg("Add Type")}
              @click=${this._handleAddType}
            >
              <ui-icon-add></ui-icon-add>
            </button>
          </div>
          <div class="types">
            ${this._types.map(
              (t) => html`
                <div class="type-item">
                  <ui-comment-type-badge .type=${t}></ui-comment-type-badge>
                  ${this._usedTypes.has(t)
                    ? ""
                    : html`
                        <button
                          class="delete-button"
                          aria-label=${msg(str`Delete Type: ${t}`)}
                          @click=${() => this._handleRemoveType(t)}
                        >
                          <ui-icon-delete></ui-icon-delete>
                        </button>
                      `}
                </div>
              `,
            )}
          </div>
        </section>
        <section aria-label=${msg("Paths")}>
          <div class="section-title">${msg("Paths")}</div>
          <div class="paths-form">${this._renderPathsForm()}</div>
          <div class="paths">${this._renderPaths()}</div>
        </section>
      </div>
    `;
  }

  private _handleRemovePath(child: string, parent: string) {
    this._paths = this._paths.filter(
      (p) => !(p.child === child && p.parent === parent),
    );
  }

  private _handleAddPath() {
    if (!this._selectedChild) return;
    // 既に存在するかチェック
    if (
      this._paths.some(
        (p) =>
          p.child === this._selectedChild && p.parent === this._selectedParent,
      )
    ) {
      return;
    }

    this._paths = [
      ...this._paths,
      { child: this._selectedChild, parent: this._selectedParent },
    ].sort((a, b) => {
      if (a.parent !== b.parent) {
        return a.parent.localeCompare(b.parent);
      }
      return a.child.localeCompare(b.child);
    });
    this._selectedChild = ""; // 追加後にリセット
  }

  private _renderPathsForm() {
    return html`
      <div class="paths-form-container">
        <select
          name="parent"
          aria-label=${msg("Parent Type Select")}
          .value=${this._selectedParent}
          @change=${(e: Event) =>
            (this._selectedParent = (e.target as HTMLSelectElement).value)}
        >
          <option value="">${msg("ROOT")}</option>
          ${this._types.map(
            (t) => html`
              <option value=${t}>${t}</option>
            `,
          )}
        </select>
        <ui-icon-arrow-back></ui-icon-arrow-back>
        <select
          name="child"
          aria-label=${msg("Child Type Select")}
          .value=${this._selectedChild}
          @change=${(e: Event) =>
            (this._selectedChild = (e.target as HTMLSelectElement).value)}
        >
          <option value="">${msg("(Select Child)")}</option>
          ${this._types.map(
            (t) => html`
              <option value=${t}>${t}</option>
            `,
          )}
        </select>
        <button
          class="btn btn-primary"
          aria-label=${msg("Add Path")}
          ?disabled=${!this._selectedChild}
          @click=${this._handleAddPath}
        >
          <ui-icon-add></ui-icon-add>
        </button>
      </div>
    `;
  }

  private _renderPaths() {
    const grouped = this._paths.reduce(
      (acc, p) => {
        if (!acc[p.parent]) acc[p.parent] = [];
        acc[p.parent].push(p.child);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return Object.entries(grouped).map(
      ([parent, children]) => html`
        <div class="path-group">
          <div class="parent-node">
            <ui-comment-type-badge
              .type=${parent === "" ? "ROOT" : parent}
            ></ui-comment-type-badge>
          </div>
          <div class="children-nodes">
            ${children.map(
              (child) => html`
                <div class="child-node">
                  <ui-comment-type-badge .type=${child}></ui-comment-type-badge>
                  ${this._usedPaths.has(`${parent}->${child}`)
                    ? ""
                    : html`
                        <button
                          class="delete-button"
                          title=${msg(str`Delete Path: ${parent} -> ${child}`)}
                          aria-label=${msg(
                            str`Delete Path: ${parent} -> ${child}`,
                          )}
                          @click=${() => this._handleRemovePath(child, parent)}
                        >
                          <ui-icon-delete></ui-icon-delete>
                        </button>
                      `}
                </div>
              `,
            )}
          </div>
        </div>
      `,
    );
  }

  static styles = [
    baseStyle,
    buttonStyle,
    inputStyle,
    titleStyle,
    commentFrameDetail,
    css`
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
        color: var(--secondary-text-color, #666);
      }
      .types-form {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .paths-form-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }
      input,
      select {
        flex: 1;
      }
      .types,
      .paths {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .type-item,
      .child-node {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .delete-button {
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--error-color, #dc3545);
        padding: 4px;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      .delete-button:hover {
        opacity: 1;
      }
    `,
  ];
}
