import { msg } from "@lit/localize";
import {
  LitElement,
  html,
  nothing,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import {
  commentTreeStickyHeaderHeightPx,
  commentTreeStyle,
} from "../../../shared/style/comment-tree";
import "../../../shared/ui/comment-type-badge/comment-type-badge";
import { buildSortedChildrenMap } from "../../../shared/util/comment-tree";
import type { Comment } from "../model/comment";
import type { DialogueSettings } from "../model/discussion";
import "./comment-item";

@customElement("dialogue-comment-tree")
export class DialogueCommentTree extends LitElement {
  @property({ type: Array })
  comments?: Comment[];

  @property({ type: Object })
  settings?: DialogueSettings;

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  isAuthenticated = false;

  @property({ type: Boolean })
  showArchived = false;

  @state()
  private childrenMap = new Map<string, Comment[]>();

  @state()
  private filterParentId?: string;

  @state()
  private filterType?: string;

  private _stickyObserver?: IntersectionObserver;

  connectedCallback() {
    super.connectedCallback();
    this._stickyObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const header = (entry.target as HTMLElement).nextElementSibling;
          if (header?.classList.contains("group-header")) {
            this.updateStickyHeaderState(
              header as HTMLElement,
              !entry.isIntersecting,
            );
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

  private updateTreeData() {
    this.childrenMap.clear();

    if (this.comments) {
      this.childrenMap = buildSortedChildrenMap(this.comments);
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

  private updateStickyHeaderState(header: HTMLElement, isStuck: boolean) {
    header.classList.toggle("stuck", isStuck);

    if (isStuck) {
      header.setAttribute("role", "button");
      header.tabIndex = 0;
      return;
    }

    header.removeAttribute("role");
    header.removeAttribute("tabindex");
  }

  private toggleShowArchived() {
    this.showArchived = !this.showArchived;
  }

  private getStickySentinelId(commentId: string) {
    return `comment-sticky-sentinel-${commentId}`;
  }

  private scrollToComment(commentId: string) {
    const target = this.renderRoot.querySelector<HTMLElement>(
      `#${this.getStickySentinelId(commentId)}`,
    );
    if (!target) return;

    const depth = Number(target.dataset.depth ?? "0");
    const offsetTop = depth * commentTreeStickyHeaderHeightPx;
    const scrollContainer = this.findScrollContainer(target);

    if (!scrollContainer) {
      const top =
        window.scrollY + target.getBoundingClientRect().top - offsetTop;
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const scrollContainerRect = scrollContainer.getBoundingClientRect();
    const top =
      scrollContainer.scrollTop +
      targetRect.top -
      scrollContainerRect.top -
      offsetTop;

    scrollContainer.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth",
    });
  }

  private findScrollContainer(target: HTMLElement) {
    let current: Node | null = target;

    while (current) {
      current = this.getComposedParent(current);
      if (!(current instanceof HTMLElement)) continue;

      const style = window.getComputedStyle(current);
      const isScrollable = /(auto|scroll)/.test(style.overflowY);
      if (isScrollable && current.scrollHeight > current.clientHeight) {
        return current;
      }
    }

    return null;
  }

  private getComposedParent(node: Node) {
    if (node instanceof ShadowRoot) {
      return node.host;
    }

    if (node instanceof HTMLElement && node.assignedSlot) {
      return node.assignedSlot;
    }

    if (node.parentNode) {
      return node.parentNode;
    }

    const root = node.getRootNode();
    return root instanceof ShadowRoot ? root.host : null;
  }

  private handleBadgeClick(parentId: string, type: string) {
    if (this.filterParentId === parentId && this.filterType === type) {
      this.filterParentId = undefined;
      this.filterType = undefined;
    } else {
      this.filterParentId = parentId;
      this.filterType = type;
    }
  }

  private handleStickyHeaderClick(commentId: string) {
    this.scrollToComment(commentId);
  }

  private handleStickyHeaderKeydown(e: KeyboardEvent, commentId: string) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    this.scrollToComment(commentId);
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

  private renderChildren(
    parentId: string,
    isParentArchived: boolean,
    depth: number,
  ) {
    const children = this.childrenMap.get(parentId) || [];
    if (children.length === 0) return nothing;

    const isFiltering =
      this.filterParentId === parentId && this.filterType !== undefined;

    let filtered = this.showArchived
      ? children
      : children.filter((c) => !c.archivedAt);

    if (isFiltering) {
      filtered = filtered.filter((c) => c.type === this.filterType);
    }

    if (filtered.length === 0) return nothing;

    return html`
      <div class="children">
        ${filtered.map((c) =>
          this.renderCommentEntry(
            c,
            parentId,
            isParentArchived,
            depth,
            isFiltering,
          ),
        )}
      </div>
    `;
  }

  private renderCommentEntry(
    comment: Comment,
    parentId: string,
    isParentArchived: boolean,
    depth: number,
    isParentFiltering: boolean,
  ): HTMLTemplateResult {
    const isArchived = isParentArchived || !!comment.archivedAt;
    const children = this.childrenMap.get(comment.id) || [];
    const activeChildrenCount = children.filter(
      (c) => c.status === "active",
    ).length;
    const isBadgeActive =
      this.filterParentId === parentId && this.filterType === comment.type;

    return html`
      <div class="child-group">
        <div
          id=${this.getStickySentinelId(comment.id)}
          class="sticky-sentinel"
          data-depth=${String(depth)}
        ></div>
        <div
          class="group-header"
          style="top: ${depth *
          commentTreeStickyHeaderHeightPx}px; z-index: ${10 - depth}"
          @click=${() => this.handleStickyHeaderClick(comment.id)}
          @keydown=${(e: KeyboardEvent) =>
            this.handleStickyHeaderKeydown(e, comment.id)}
        >
          <ui-comment-type-badge
            .type=${comment.type}
            .clickable=${true}
            .active=${isBadgeActive}
            @click=${(e: Event) => {
              e.stopPropagation();
              this.handleBadgeClick(parentId, comment.type);
            }}
          ></ui-comment-type-badge>
          <span class="parent-content" title=${comment.content}>
            ${comment.content}
          </span>
        </div>
        <div class="group-content">
          <div class="comment-node">
            <dialogue-comment-item
              .comment=${comment}
              .activeChildrenCount=${activeChildrenCount}
              .settings=${this.settings}
              .archived=${isArchived}
              .readonly=${this.readonly}
              .isAuthenticated=${this.isAuthenticated}
            ></dialogue-comment-item>
            ${isParentFiltering
              ? nothing
              : this.renderChildren(comment.id, isArchived, depth + 1)}
          </div>
        </div>
      </div>
    `;
  }

  static styles = [baseStyle, commentTreeStyle];
}
