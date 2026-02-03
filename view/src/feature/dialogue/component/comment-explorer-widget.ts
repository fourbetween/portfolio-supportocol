import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import { widgetStyle } from "../../../shared/style/widget";
import {
  DialogueCommentCreatedEvent,
  DialogueCommentSelectEvent,
  type DialogueCommentCreateEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import "../ui/comment-context/comment-context";
import "../ui/comment-tree/comment-tree";
import "./comment-create-widget";

@customElement("dialogue-comment-explorer-widget")
export class DialogueCommentExplorerWidget extends LitElement {
  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Array })
  comments?: Comment[];

  @property({ type: String })
  selectedCommentId?: string;

  @property({ type: Boolean })
  readonly = false;

  @state()
  private childCounts = new Map<string, number>();

  private commentMap = new Map<string, Comment>();
  private childrenMap = new Map<string, Comment[]>();

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.updateDerivedData();
    }
  }

  private updateDerivedData() {
    this.commentMap.clear();
    this.childrenMap.clear();
    this.childCounts = new Map();

    if (this.comments) {
      for (const comment of this.comments) {
        this.commentMap.set(comment.id, comment);
        if (comment.parentCommentId) {
          const children = this.childrenMap.get(comment.parentCommentId) || [];
          children.push(comment);
          this.childrenMap.set(comment.parentCommentId, children);
        }
      }

      for (const [parentId, children] of this.childrenMap) {
        this.childCounts.set(
          parentId,
          children.filter((c) => c.status === "active").length,
        );
      }
    }
  }

  private async handleCommentCreate(e: DialogueCommentCreateEvent) {
    if (!this.discussion || this.readonly) return;
    try {
      const data = await commentRepository.create(this.discussion.id, {
        parentCommentId: e.parentCommentId,
        commentType: e.commentType,
        content: e.content,
      });

      showToast(this, "Comment created.", "success", 2000);
      if (data) {
        this.dispatchEvent(new DialogueCommentCreatedEvent(data));
      }
    } catch (error: any) {
      showToast(this, error.message, "error");
    }
  }

  private handleClearSelection() {
    this.dispatchEvent(new DialogueCommentSelectEvent(undefined));
  }

  private get _path(): Comment[] {
    return this.selectedCommentId
      ? this.getPathToRoot(this.selectedCommentId)
      : [];
  }

  private get _descendants(): Comment[] {
    return this.selectedCommentId
      ? this.getDescendants(this.selectedCommentId)
      : this.comments || [];
  }

  private getPathToRoot(selectedId: string): Comment[] {
    const path: Comment[] = [];
    let currentId: string | null = selectedId;

    while (currentId) {
      const comment = this.commentMap.get(currentId);
      if (!comment) break;
      path.unshift(comment);
      currentId = comment.parentCommentId;
    }

    return path;
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
    const path = this._path;
    const descendants = this._descendants;

    return html`
      <div class="container">
        ${this.renderContextSection(path)}
        ${this.selectedCommentId || this.readonly
          ? nothing
          : html`
              <dialogue-comment-create-widget
                .frame=${this.discussion?.dialogueSettings.commentFrame}
                @dialogue-comment-create=${this.handleCommentCreate}
              ></dialogue-comment-create-widget>
            `}
        <div class="section">
          <div class="section-title">
            ${this.selectedCommentId ? "Replies" : "All Comments"}
          </div>
          <dialogue-comment-tree
            .comments=${descendants}
            .frame=${this.discussion?.dialogueSettings.commentFrame}
            .readonly=${this.readonly}
            @dialogue-comment-create=${this.handleCommentCreate}
          ></dialogue-comment-tree>
        </div>
      </div>
    `;
  }

  private renderContextSection(path: Comment[]) {
    if (path.length === 0) return nothing;

    return html`
      <div class="section">
        <div class="section-header">
          <div class="section-title">Context</div>
          <button class="clear-button" @click=${this.handleClearSelection}>
            <span class="material-symbols-outlined">close</span>
            <span>Clear Selection</span>
          </button>
        </div>
        <dialogue-comment-context
          .path=${path}
          .childCounts=${this.childCounts}
          .frame=${this.discussion?.dialogueSettings.commentFrame}
          .readonly=${this.readonly}
          @dialogue-comment-create=${this.handleCommentCreate}
        ></dialogue-comment-context>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    iconStyle,
    titleStyle,
    widgetStyle,
    css`
      :host {
        display: block;
      }
      .section-header .section-title {
        margin-bottom: 0;
      }
    `,
  ];
}
