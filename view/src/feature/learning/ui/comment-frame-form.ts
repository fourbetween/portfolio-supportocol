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

@customElement("learning-comment-frame-form")
export class LearningCommentFrameForm extends LitElement {
  @property({ type: Object })
  initialFrame?: CommentFrame | null;

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

  private _usedTypes: Set<string> = new Set();

  private _usedPaths: Set<string> = new Set();

  get value(): CommentFrame {
    return {
      types: [...this._types],
      paths: [...this._paths],
    };
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("initialFrame")) {
      if (this.initialFrame) {
        this._types = [...this.initialFrame.types];
        this._paths = [...this.initialFrame.paths];
      } else {
        this._types = [];
        this._paths = [];
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

  private _handleTypeNameKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.isComposing) {
      this._handleAddType();
    }
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
    this._paths = this._paths.filter(
      (p) => p.child !== type && p.parent !== type,
    );
  }

  private _handleRemovePath(child: string, parent: string) {
    this._paths = this._paths.filter(
      (p) => !(p.child === child && p.parent === parent),
    );
  }

  private _handleAddPath() {
    if (!this._selectedChild) return;
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
    this._selectedChild = "";
  }

  render() {
    return html`
      <div class="container">
        <section aria-label=${msg("Types")}>
          <div class="section-title">${msg("Types")}</div>
          <div class="types-form">
            <input
              type="text"
              placeholder=${msg("New type...")}
              .value=${this._newTypeName}
              @input=${this._handleTypeNameInput}
              @keydown=${this._handleTypeNameKeydown}
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

  private _renderPathsForm() {
    return html`
      <div class="paths-form-container">
        <select
          name="parent"
          aria-label=${msg("Select Parent Type")}
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
          aria-label=${msg("Select Child Type")}
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
        color: var(--color-danger-fg);
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
