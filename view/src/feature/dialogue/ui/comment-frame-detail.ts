import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { commentFrameDetail } from "../../../shared/style/comment-frame-detail";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../model/comment";
import { type CommentFrame, sortCommentFrame } from "../model/comment-frame";

@customElement("dialogue-comment-frame-detail")
export class DialogueCommentFrameDetail extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  @property({ type: Array })
  comments: Comment[] = [];

  private get _sortedFrame() {
    if (!this.frame) return undefined;
    if (this.comments.length === 0) return this.frame;
    return sortCommentFrame(this.frame, this.comments);
  }

  private get _groupedPaths() {
    const frame = this._sortedFrame;
    if (!frame) return {};
    return frame.paths.reduce(
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
    const frame = this._sortedFrame;
    if (!frame) return html``;

    return html`
      <div class="container">
        <section>
          <div class="section-title">${msg("Types")}</div>
          <div class="types">${this._renderTypes(frame)}</div>
        </section>
        <section>
          <div class="section-title">${msg("Paths")}</div>
          <div class="paths">${this._renderPaths()}</div>
        </section>
      </div>
    `;
  }

  private _renderTypes(frame: CommentFrame) {
    return frame.types.map(
      (t) => html`
        <ui-comment-type-badge
          .type=${t || msg("Root")}
        ></ui-comment-type-badge>
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
            .type=${parent || msg("Root")}
          ></ui-comment-type-badge>
        </div>
        <div class="children-nodes">
          ${children.map(
            (child) => html`
              <div class="child-node">
                <ui-comment-type-badge
                  .type=${child || msg("Root")}
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
