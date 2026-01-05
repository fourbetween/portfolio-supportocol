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
import { iconStyle } from "../../../../shared/style/icon";
import type { Comment } from "../../model/comment";
import { deriveCommentFrame } from "../../model/comment-frame";
import "../comment-item/comment-item";
import "../comment-type-badge/comment-type-badge";

@customElement("learning-comment-tree")
export class LearningCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @state()
  private childrenMap = new Map<string, Comment[]>();

  @state()
  private availableTypes: string[] = [];

  @state()
  private focusedGroupId?: string;

  private toggleFocus(groupId: string) {
    this.focusedGroupId = this.focusedGroupId === groupId ? undefined : groupId;
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
      <div class="tree">${this.renderChildren("root")}</div>
    `;
  }

  private renderComment(
    comment: Comment,
    hideChildren: boolean = false
  ): HTMLTemplateResult {
    const children = this.childrenMap.get(comment.id) || [];
    const activeChildrenCount = children.filter(
      (c) => c.status === "active"
    ).length;

    return html`
      <div class="comment-node">
        <learning-comment-item
          .comment=${comment}
          .activeChildrenCount=${activeChildrenCount}
          .availableTypes=${this.availableTypes}
        ></learning-comment-item>
        ${!hideChildren ? this.renderChildren(comment.id) : nothing}
      </div>
    `;
  }

  private renderChildren(parentId: string) {
    const children = this.childrenMap.get(parentId) || [];
    if (children.length === 0) return nothing;

    const groupedChildren = this.groupCommentsByType(children);

    return html`
      <div class="children">
        ${Object.entries(groupedChildren).map(([type, typeChildren]) =>
          this.renderGroup(type, typeChildren, parentId)
        )}
      </div>
    `;
  }

  private renderGroup(
    type: string,
    comments: Comment[],
    parentCommentId?: string
  ): HTMLTemplateResult {
    const groupId = this.getGroupId(type, parentCommentId);
    const isFocused = this.focusedGroupId === groupId;

    return html`
      <div class="child-group">
        <div class="group-header">
          <learning-comment-type-badge
            .type=${type}
            .active=${isFocused}
            .clickable=${true}
            @click=${() => this.toggleFocus(groupId)}
            title="Click to focus on this group"
          ></learning-comment-type-badge>
        </div>
        <div class="group-content">
          ${comments.map((comment) => this.renderComment(comment, isFocused))}
        </div>
      </div>
    `;
  }

  private getGroupId(type: string, parentCommentId?: string): string {
    return `${parentCommentId ?? "root"}-${type}`;
  }

  private groupCommentsByType(comments: Comment[]): Record<string, Comment[]> {
    return comments.reduce((acc, comment) => {
      if (!acc[comment.commentType]) {
        acc[comment.commentType] = [];
      }
      acc[comment.commentType].push(comment);
      return acc;
    }, {} as Record<string, Comment[]>);
  }

  static styles = [
    baseStyle,
    iconStyle,
    css`
      .comment-node {
        margin-bottom: 16px;
      }
      .children {
        margin-left: 8px;
      }
      .child-group {
        margin-top: 12px;
        margin-bottom: 12px;
      }
      .group-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .group-content {
        margin-left: 8px;
        padding-left: 8px;
        border-left: 1px dashed var(--color-border-muted);
      }
    `,
  ];
}
