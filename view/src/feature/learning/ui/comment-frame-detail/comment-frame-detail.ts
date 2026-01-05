import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { titleStyle } from "../../../../shared/style/title";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-frame-detail")
export class LearningCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  private get _groupedPaths() {
    if (!this.frame) return {};
    return this.frame.paths.reduce((acc, p) => {
      if (!acc[p.parent]) {
        acc[p.parent] = [];
      }
      acc[p.parent].push(p.child);
      return acc;
    }, {} as Record<string, string[]>);
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
        <learning-comment-type-badge .type=${t}></learning-comment-type-badge>
      `
    );
  }

  private _renderPaths() {
    return Object.entries(this._groupedPaths).map(([parent, children]) =>
      this._renderPathGroup(parent, children)
    );
  }

  private _renderPathGroup(parent: string, children: string[]) {
    return html`
      <div class="path-group">
        <div class="parent-node">
          <learning-comment-type-badge
            .type=${parent}
          ></learning-comment-type-badge>
        </div>
        <div class="children-nodes">
          ${children.map(
            (child) => html`
              <div class="child-node">
                <learning-comment-type-badge
                  .type=${child}
                ></learning-comment-type-badge>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    titleStyle,
    css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .types {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .paths {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .path-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .parent-node {
        align-self: flex-start;
      }
      .children-nodes {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-left: 8px;
        padding-left: 16px;
        border-left: 1px dashed var(--color-border-muted);
        margin-top: 4px;
      }
      .child-node {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    `,
  ];
}
