import { LitElement, css, html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Comment } from "../model/comment";
import "../ui/comment-context/comment-context";
import "../ui/comment-tree/comment-tree";

@customElement("learning-comment-explorer-widget")
export class LearningCommentExplorerWidget extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @state()
  private selectedCommentId?: string;

  private commentMap = new Map<string, Comment>();
  private childrenMap = new Map<string, Comment[]>();

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.commentMap.clear();
      this.childrenMap.clear();

      if (this.comments) {
        for (const comment of this.comments) {
          this.commentMap.set(comment.id, comment);
          if (comment.parentCommentId) {
            const children =
              this.childrenMap.get(comment.parentCommentId) || [];
            children.push(comment);
            this.childrenMap.set(comment.parentCommentId, children);
          }
        }
      }
    }
  }

  private handleCommentClick(comment: Comment) {
    this.selectedCommentId = comment.id;
  }

  private getAncestors(selectedId: string): Comment[] {
    const ancestors: Comment[] = [];
    let currentId: string | null = selectedId;

    while (currentId) {
      const comment = this.commentMap.get(currentId);
      if (!comment) break;
      ancestors.unshift(comment);
      currentId = comment.parentCommentId;
    }

    return ancestors;
  }

  private getDescendants(selectedId: string): Comment[] {
    const descendants: Comment[] = [];
    const queue = [selectedId];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const children = this.childrenMap.get(currentId) || [];
      descendants.push(...children);
      queue.push(...children.map((c) => c.id));
    }

    return descendants;
  }

  render() {
    const ancestors = this.selectedCommentId
      ? this.getAncestors(this.selectedCommentId)
      : [];
    const descendants = this.selectedCommentId
      ? this.getDescendants(this.selectedCommentId)
      : this.comments || [];

    return html`
      <div class="container">
        ${ancestors.length > 0
          ? html`
              <div class="section">
                <div class="label">Context</div>
                <learning-comment-context
                  .ancestors=${ancestors}
                  .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
                ></learning-comment-context>
              </div>
            `
          : ""}
        <div class="section">
          <div class="label">
            ${this.selectedCommentId ? "Replies" : "All Comments"}
          </div>
          <learning-comment-tree
            .comments=${descendants}
            .onCommentClick=${(c: Comment) => this.handleCommentClick(c)}
          ></learning-comment-tree>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .label {
      font-size: 0.8rem;
      font-weight: bold;
      color: var(--color-fg-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `;
}
