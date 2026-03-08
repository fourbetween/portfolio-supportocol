import { msg } from "@lit/localize";
import {
  LitElement,
  css,
  html,
  nothing,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { baseStyle } from "../../../shared/style/base";
import { commentTreeStyle } from "../../../shared/style/comment-tree";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import type { Comment } from "../model/comment";
import { deriveCommentFrame } from "../model/comment-frame";
import "./comment-item";

@customElement("learning-comment-tree")
export class LearningCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  showArchived = false;

  @property({ type: String })
  cutCommentId?: string;

  @property({ type: Array })
  invalidPasteTargetIds: string[] = [];

  @state()
  private childrenMap = new Map<string, Comment[]>();

  @state()
  private availableTypes: string[] = [];

  private _stickyObserver?: IntersectionObserver;

  connectedCallback() {
    super.connectedCallback();
    this._stickyObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const header = (entry.target as HTMLElement).nextElementSibling;
          if (header?.classList.contains("group-header")) {
            header.classList.toggle("stuck", !entry.isIntersecting);
          }
        }
      },
      { threshold: [0] },
    );
  }

  disconnectedCallback() {
    this._stickyObserver?.disconnect();
    this._stickyObserver = undefined;
    super.disconnectedCallback();
  }

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.updateTreeData();
    }
  }

  updated(changedProperties: PropertyValues<this>) {
    if (
      changedProperties.has("comments") ||
      changedProperties.has("showArchived")
    ) {
      this.observeSentinels();
    }
  }

  private observeSentinels() {
    if (!this._stickyObserver) return;
    this._stickyObserver.disconnect();
    const sentinels = this.renderRoot.querySelectorAll(".sticky-sentinel");
    sentinels.forEach((s) => this._stickyObserver!.observe(s));
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

  private toggleShowArchived() {
    this.showArchived = !this.showArchived;
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
          ${msg("Show archived")}
        </label>
      </div>
      <div class="tree">${this.renderChildren("root", false, 0)}</div>
    `;
  }

  private renderChildren(parentId: string, isArchived: boolean, depth: number) {
    const children = this.childrenMap.get(parentId) || [];
    if (children.length === 0) return nothing;

    const filtered = this.showArchived
      ? children
      : children.filter((c) => !c.archivedAt);

    if (filtered.length === 0) return nothing;

    return html`
      <div class="children">
        ${repeat(
          filtered,
          (c) => c.id,
          (c) => this.renderCommentEntry(c, isArchived, depth),
        )}
      </div>
    `;
  }

  private renderCommentEntry(
    comment: Comment,
    isParentArchived: boolean,
    depth: number,
  ): HTMLTemplateResult {
    const isArchived = isParentArchived || !!comment.archivedAt;
    const children = this.childrenMap.get(comment.id) || [];
    const activeChildrenCount = children.filter(
      (c) => c.status === "active",
    ).length;

    return html`
      <div class="child-group">
        <div class="sticky-sentinel"></div>
        <div
          class="group-header"
          style="top: ${depth * 28}px; z-index: ${10 - depth}"
        >
          <ui-comment-type-badge .type=${comment.type}></ui-comment-type-badge>
          <span class="parent-content" title=${comment.content}>
            ${comment.content}
          </span>
        </div>
        <div class="group-content">
          <div class="comment-node">
            <learning-comment-item
              class="comment-item"
              .comment=${comment}
              .activeChildrenCount=${activeChildrenCount}
              .availableTypes=${this.availableTypes}
              .readonly=${this.readonly}
              .archived=${isArchived}
              .cutCommentId=${this.cutCommentId}
              .invalidPasteTargetIds=${this.invalidPasteTargetIds}
            ></learning-comment-item>
            ${this.renderChildren(comment.id, isArchived, depth + 1)}
          </div>
        </div>
      </div>
    `;
  }

  static styles = [baseStyle, commentTreeStyle, css``];
}
