import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { iconStyle } from "../../../../shared/style/icon";
import { titleStyle } from "../../../../shared/style/title";
import type { CommentFrame } from "../../model/comment-frame";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-frame-detail")
export class LearningCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  render() {
    if (!this.frame) return html``;

    const groupedPaths = this.frame.paths.reduce((acc, p) => {
      if (!acc[p.parent]) {
        acc[p.parent] = [];
      }
      acc[p.parent].push(p.child);
      return acc;
    }, {} as Record<string, string[]>);

    return html`
      <div class="container">
        <section>
          <div class="section-title">Types</div>
          <div class="types">
            ${this.frame.types.map(
              (t) =>
                html`
                  <learning-comment-type-badge
                    .type=${t}
                  ></learning-comment-type-badge>
                `
            )}
          </div>
        </section>
        <section>
          <div class="section-title">Paths</div>
          <div class="paths">
            ${Object.entries(groupedPaths).map(
              ([parent, children]) => html`
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
                          <span class="material-symbols-outlined">
                            north_west
                          </span>
                          <learning-comment-type-badge
                            .type=${child}
                          ></learning-comment-type-badge>
                        </div>
                      `
                    )}
                  </div>
                </div>
              `
            )}
          </div>
        </section>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
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
        padding-left: 24px;
      }
      .child-node {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .material-symbols-outlined {
        font-size: 18px;
        color: var(--color-fg-muted);
      }
    `,
  ];
}
