import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { commentFrameDetail } from "../../../shared/style/comment-frame-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { CommentFrame } from "../model/comment-frame";
import "./comment-type-rename-popup";
import type { LearningCommentTypeRenamePopup } from "./comment-type-rename-popup";

@customElement("learning-comment-frame-detail")
export class LearningCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  @query("learning-comment-type-rename-popup")
  private _renamePopup!: LearningCommentTypeRenamePopup;

  private get _groupedPaths() {
    if (!this.frame) return {};
    return this.frame.paths.reduce(
      (acc, p) => {
        if (!acc[p.parent]) {
          acc[p.parent] = [];
        }
        acc[p.parent].push(p.child);
        return acc;
      },
      {} as Record<string, string[]>,
    );
  }

  render() {
    if (!this.frame) return html``;

    return html`
      <div class="container">
        <section>
          <div class="section-title">${msg("Types")}</div>
          <div class="types">${this._renderTypes()}</div>
        </section>
        <section>
          <div class="section-title">${msg("Paths")}</div>
          <div class="paths">${this._renderPaths()}</div>
        </section>
      </div>
      <learning-comment-type-rename-popup></learning-comment-type-rename-popup>
    `;
  }

  private _renderTypes() {
    return this.frame!.types.map((t) => this._renderTypeBadge(t));
  }

  private _renderPaths() {
    return Object.entries(this._groupedPaths).map(([parent, children]) =>
      this._renderPathGroup(parent, children),
    );
  }

  private _renderPathGroup(parent: string, children: string[]) {
    return html`
      <div class="path-group">
        <div class="parent-node">${this._renderTypeBadge(parent)}</div>
        <div class="children-nodes">
          ${children.map(
            (child) => html`
              <div class="child-node">${this._renderTypeBadge(child)}</div>
            `,
          )}
        </div>
      </div>
    `;
  }

  private _renderTypeBadge(type: string) {
    const displayType = type || msg("Root");
    if (!type) {
      return html`
        <ui-comment-type-badge .type=${displayType}></ui-comment-type-badge>
      `;
    }

    return html`
      <ui-comment-type-badge
        .type=${displayType}
        .clickable=${true}
        @click=${() => this._handleTypeClick(type)}
      ></ui-comment-type-badge>
    `;
  }

  private _handleTypeClick(type: string) {
    this._renamePopup.show(type);
  }

  static styles = [baseStyle, titleStyle, commentFrameDetail, css``];
}
