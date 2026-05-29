import { msg } from "@lit/localize";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../../../shared/ui/icons/icon-content-copy";
import "../../../shared/ui/popup/popup";
import { buildSortedChildrenMap } from "../../../shared/util/comment-tree";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";

@customElement("learning-discussion-markdown-popup")
export class LearningDiscussionMarkdownPopup extends LitElement {
  @property({ type: Boolean })
  open = false;

  @property({ type: Object })
  discussion?: Discussion;

  @property({ type: Array })
  comments: Comment[] = [];

  private get _markdown(): string {
    if (!this.discussion) return "";
    return toMarkdown(this.discussion, this.comments);
  }

  private _handleClose() {
    this.open = false;
  }

  private async _handleCopy() {
    await navigator.clipboard.writeText(this._markdown);
  }

  render() {
    return html`
      <ui-popup .open=${this.open} @popup-closed=${this._handleClose}>
        <div slot="header">${msg("Export as Markdown")}</div>
        <div slot="main">
          <pre class="markdown-content">${this._markdown}</pre>
        </div>
        <div slot="footer">
          <button class="btn" @click=${this._handleClose}>
            ${msg("Close")}
          </button>
          <button class="btn btn-primary" @click=${this._handleCopy}>
            <ui-icon-content-copy></ui-icon-content-copy>
            ${msg("Copy")}
          </button>
        </div>
      </ui-popup>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .markdown-content {
        font-family: var(--fontStack-monospace, monospace);
        font-size: 0.85rem;
        white-space: pre-wrap;
        word-break: break-word;
        margin: 0;
        background-color: var(--color-canvas-subtle);
        border-radius: 4px;
        padding: 12px;
        max-height: 60vh;
        overflow-y: auto;
      }
    `,
  ];
}

function toMarkdown(discussion: Discussion, comments: Comment[]): string {
  const parts: string[] = [];

  parts.push(`# ${discussion.theme}\n\n`);

  if (discussion.premise) {
    parts.push(`## Premise\n\n${discussion.premise}\n\n`);
  }

  if (discussion.conclusion) {
    parts.push(`## Conclusion\n\n${discussion.conclusion}\n\n`);
  }

  const archivedIds = collectArchivedDescendantIds(comments);
  const activeComments = comments.filter((c) => !archivedIds.has(c.id));
  if (activeComments.length > 0) {
    const childrenMap = buildSortedChildrenMap(activeComments);
    parts.push(renderCommentTree(childrenMap, "root", 1));
  }

  return parts.join("");
}

function collectArchivedDescendantIds(comments: Comment[]): Set<string> {
  const archivedIds = new Set<string>();
  for (const c of comments) {
    if (c.archivedAt) {
      archivedIds.add(c.id);
    }
  }

  const childrenMap = new Map<string, Comment[]>();
  for (const c of comments) {
    const parentId = c.parentCommentId ?? "root";
    const children = childrenMap.get(parentId) || [];
    children.push(c);
    childrenMap.set(parentId, children);
  }

  function addDescendants(id: string) {
    const children = childrenMap.get(id) || [];
    for (const child of children) {
      archivedIds.add(child.id);
      addDescendants(child.id);
    }
  }

  for (const id of [...archivedIds]) {
    addDescendants(id);
  }

  return archivedIds;
}

function circledNumber(n: number): string {
  if (n >= 1 && n <= 20) {
    return String.fromCharCode(0x245f + n);
  }
  return `(${n})`;
}

function renderCommentTree(
  childrenMap: Map<string, Comment[]>,
  parentId: string,
  depth: number,
): string {
  const children = childrenMap.get(parentId);
  if (!children || children.length === 0) return "";

  const suffixes: string[] = new Array(children.length).fill("");
  if (depth <= 2) {
    let i = 0;
    while (i < children.length) {
      let j = i + 1;
      while (j < children.length && children[j].type === children[i].type) {
        j++;
      }
      const count = j - i;
      if (count >= 2) {
        for (let k = i; k < j; k++) {
          suffixes[k] = circledNumber(k - i + 1);
        }
      }
      i = j;
    }
  }

  return children
    .map((comment, idx) => {
      const suffix = suffixes[idx];

      if (depth === 1) {
        // 階層0: ルートコメントを記事のタイトル・リード文として出力
        const title = `\n## 【${comment.type}${suffix}】${comment.content}\n\n`;
        const nested = renderCommentTree(childrenMap, comment.id, depth + 1);
        return `${title}${nested}`;
      } else if (depth === 2) {
        // 階層1: 章立て
        const header = `\n### 【${comment.type}${suffix}】\n\n`;
        const body = `${comment.content}\n\n`;
        const nested = renderCommentTree(childrenMap, comment.id, depth + 1);
        return `${header}${body}${nested}`;
      } else {
        // 階層2以降: 箇条書きリスト
        const indent = "  ".repeat(depth - 2);
        const line = `${indent}- **${comment.type}**: ${comment.content}\n`;
        const nested = renderCommentTree(childrenMap, comment.id, depth + 1);
        if (nested) {
          return `${line}${nested}`;
        }
        return line;
      }
    })
    .join("");
}
