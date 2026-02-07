import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { commentFrameDetail } from "../../../shared/style/comment-frame-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { CommentFrame } from "../model/comment-frame";

@customElement("dialogue-comment-frame-detail")
export class DialogueCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

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
          <div class="section-title">Types</div>
          <div class="types">${this._renderTypes()}</div>
        </section>
        <section>
          <div class="section-title">Paths</div>
          <div class="paths">${this._renderPaths()}</div>
        </section>
      </div>
    `;
  }

  private _renderTypes() {
    return this.frame!.types.map(
      (t) => html`
        <ui-comment-type-badge .type=${t || "Root"}></ui-comment-type-badge>
      `,
    );
  }

  private _renderPaths() {
    return Object.entries(this._groupedPaths).map(([parent, children]) =>
      this._renderPathGroup(parent, children),
    );
  }

  private _renderPathGroup(parent: string, children: string[]) {
    return html`
      <div class="path-group">
        <div class="parent-node">
          <ui-comment-type-badge
            .type=${parent || "Root"}
          ></ui-comment-type-badge>
        </div>
        <div class="children-nodes">
          ${children.map(
            (child) => html`
              <div class="child-node">
                <ui-comment-type-badge
                  .type=${child || "Root"}
                ></ui-comment-type-badge>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  static styles = [baseStyle, titleStyle, commentFrameDetail, css``];
}
