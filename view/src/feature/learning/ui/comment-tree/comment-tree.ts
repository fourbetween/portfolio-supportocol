import {
  LitElement,
  css,
  html,
  nothing,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import { commentTreeStyle } from "../../../../shared/style/comment-tree";
import { iconStyle } from "../../../../shared/style/icon";
import "../../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../../model/comment";
import { deriveCommentFrame } from "../../model/comment-frame";
import "../comment-item/comment-item";

@customElement("learning-comment-tree")
export class LearningCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  showArchived = false;

  @state()
  private childrenMap = new Map<string, Comment[]>();

  @state()
  private availableTypes: string[] = [];

  @state()
  private focusedGroupId?: string;

  private toggleFocus(groupId: string) {
    this.focusedGroupId = this.focusedGroupId === groupId ? undefined : groupId;
  }

  private toggleShowArchived() {
    this.showArchived = !this.showArchived;
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.updateTreeData();
    }
  }

  private updateTreeData() {
    this.childrenMap.clear();
    this.availableTypes = [];

    if (this.comments) {
      this.availableTypes = deriveCommentFrame(this.comments).types;
      const commentIds = new Set(this.comments.map((c) => c.id));
      for (const comment of this.comments) {
        const parentId =
          comment.parentCommentId && commentIds.has(comment.parentCommentId)
            ? comment.parentCommentId
            : "root";

        const children = this.childrenMap.get(parentId) || [];
        children.push(comment);
        this.childrenMap.set(parentId, children);
      }
    }
  }

  render() {
    if (!this.comments) return nothing;

    return html`
      <div class="controls">
        <label class="show-archived">
          <input
            type="checkbox"
            .checked=${this.showArchived}
            @change=${this.toggleShowArchived}
          />
          Show archived
        </label>
      </div>
      <div class="tree">${this.renderChildren("root", false)}</div>
    `;
  }

  private renderComment(
    comment: Comment,
    hideChildren: boolean = false,
    isArchived: boolean = false,
  ): HTMLTemplateResult {
    const children = this.childrenMap.get(comment.id) || [];
    const activeChildrenCount = children.filter(
      (c) => c.status === "active",
    ).length;

    const currentArchived = isArchived || !!comment.archivedAt;

    return html`
      <div class="comment-node">
        <learning-comment-item
          .comment=${comment}
          .activeChildrenCount=${activeChildrenCount}
          .availableTypes=${this.availableTypes}
          .readonly=${this.readonly}
          .archived=${currentArchived}
        ></learning-comment-item>
        ${!hideChildren
          ? this.renderChildren(comment.id, currentArchived)
          : nothing}
      </div>
    `;
  }

  private renderChildren(parentId: string, isArchived: boolean) {
    const children = this.childrenMap.get(parentId) || [];
    if (children.length === 0) return nothing;

    const filteredChildren = this.showArchived
      ? children
      : children.filter((c) => !c.archivedAt);

    if (filteredChildren.length === 0) return nothing;

    const groupedChildren = this.groupCommentsByType(filteredChildren);

    return html`
      <div class="children">
        ${Object.entries(groupedChildren).map(([type, typeChildren]) =>
          this.renderGroup(type, typeChildren, isArchived, parentId),
        )}
      </div>
    `;
  }

  private renderGroup(
    type: string,
    comments: Comment[],
    isArchived: boolean,
    parentCommentId?: string,
  ): HTMLTemplateResult {
    const groupId = this.getGroupId(type, parentCommentId);
    const isFocused = this.focusedGroupId === groupId;

    return html`
      <div class="child-group">
        <div class="group-header">
          <ui-comment-type-badge
            .type=${type}
            .active=${isFocused}
            .clickable=${true}
            @click=${() => this.toggleFocus(groupId)}
            title="Click to focus on this group"
          ></ui-comment-type-badge>
        </div>
        <div class="group-content">
          ${comments.map((comment) =>
            this.renderComment(comment, isFocused, isArchived),
          )}
        </div>
      </div>
    `;
  }

  private getGroupId(type: string, parentCommentId?: string): string {
    return `${parentCommentId ?? "root"}-${type}`;
  }

  private groupCommentsByType(comments: Comment[]): Record<string, Comment[]> {
    return comments.reduce(
      (acc, comment) => {
        if (!acc[comment.commentType]) {
          acc[comment.commentType] = [];
        }
        acc[comment.commentType].push(comment);
        return acc;
      },
      {} as Record<string, Comment[]>,
    );
  }

  static styles = [baseStyle, iconStyle, commentTreeStyle, css``];
}
