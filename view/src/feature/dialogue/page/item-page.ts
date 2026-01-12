import { Task } from "@lit/task";
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { TouchController } from "../../../app/controller/touch";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { iconStyle } from "../../../shared/style/icon";
import "../../../shared/ui/drawer/drawer";
import "../component/comment-explorer-widget";
import {
  type DialogueCommentCreatedEvent,
  type DialogueCommentSelectEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import { deriveCommentFrame, type CommentFrame } from "../model/comment-frame";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/comment-frame-detail/comment-frame-detail";
import "../ui/comment-list/comment-list";
import "../ui/discussion-detail/discussion-detail";

@customElement("dialogue-item-page")
export class DialogueItemPage extends LitElement {
  private _touch = new TouchController(this);

  @property({ type: String })
  discussionId!: string;

  @state()
  private _discussion?: Discussion;

  @state()
  comments: Comment[] = [];

  @state()
  private _selectedCommentId?: string;

  @state()
  private _isRightDrawerOpen = false;

  // TODO: comment frame を discussion から直接取得するようにして、削除する
  @state()
  private frame?: CommentFrame;

  willUpdate(changedProperties: PropertyValues<this>) {
    if (changedProperties.has("comments")) {
      this.frame = undefined;
      if (this.comments) {
        this.frame = deriveCommentFrame(this.comments);
      }
    }
  }

  constructor() {
    super();

    new Task(this, {
      task: async ([discussionId]) => {
        return await discussionRepository.load(discussionId);
      },
      onComplete: (discussion) => {
        this._discussion = discussion;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.discussionId],
    });

    new Task(this, {
      task: async ([discussionId]) => {
        if (!discussionId) return [] as Comment[];
        return await commentRepository.list(discussionId);
      },
      onComplete: (comments) => {
        this.comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.discussionId],
    });
  }

  private _handleCommentSelect(e: DialogueCommentSelectEvent) {
    this._selectedCommentId = e.commentId;
  }

  private _handleCommentCreated(e: DialogueCommentCreatedEvent) {
    this.comments = [...this.comments, e.comment];
  }

  private _renderRightSidebar(isTouch: boolean) {
    const list = html`
      <dialogue-comment-list .comments=${this.comments}></dialogue-comment-list>
    `;

    if (isTouch) {
      return html`
        <ui-drawer
          placement="right"
          .open=${this._isRightDrawerOpen}
          @drawer-close=${() => (this._isRightDrawerOpen = false)}
        >
          <span slot="header">Comments</span>
          ${list}
        </ui-drawer>
      `;
    }

    return html`
      <aside class="sidebar sidebar-right">${list}</aside>
    `;
  }

  private _renderMainContent() {
    return html`
      <main class="main">
        <div class="detail">
          <dialogue-discussion-detail
            .discussion=${this._discussion}
          ></dialogue-discussion-detail>
        </div>
        <div class="comment-frame">
          <dialogue-comment-frame-detail
            .frame=${this.frame}
          ></dialogue-comment-frame-detail>
        </div>
        <div class="comment-explorer">
          <dialogue-comment-explorer-widget
            .discussion=${this._discussion}
            .comments=${this.comments}
            .frame=${this.frame}
            .selectedCommentId=${this._selectedCommentId}
            @dialogue-comment-select=${this._handleCommentSelect}
            @dialogue-comment-created=${this._handleCommentCreated}
          ></dialogue-comment-explorer-widget>
        </div>
      </main>
    `;
  }

  private _renderFAB() {
    if (!this._touch.isTouchDevice) return nothing;

    return html`
      <button
        class="btn-hover btn-right"
        @click=${() => (this._isRightDrawerOpen = true)}
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
    `;
  }

  render() {
    if (!this._discussion) return nothing;

    const isTouch = this._touch.isTouchDevice;

    return html`
      <div class="dashboard hover-container">
        ${this._renderMainContent()} ${this._renderRightSidebar(isTouch)}
        ${this._renderFAB()}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    hoverButtonStyle,
    css`
      :host {
        display: block;
        height: 100%;
      }
      .dashboard {
        display: flex;
        height: 100%;
        overflow: hidden;
        position: relative;
      }
      .sidebar {
        width: 300px;
        overflow-y: auto;
      }
      .sidebar-right {
        border-left: 1px solid var(--color-border-default);
      }
      .main {
        flex: 1;
        display: flex;
        gap: 16px;
        flex-direction: column;
        overflow-y: auto;
      }
      .detail,
      .comment-frame,
      .comment-explorer {
        padding: 0 16px;
      }
      .detail {
        border-bottom: 1px solid var(--color-border-default);
      }
      .btn-hover {
        width: 48px;
        height: 48px;
        position: absolute;
      }
      .btn-hover .material-symbols-outlined {
        font-size: 24px;
      }
      .btn-right {
        right: 16px;
        bottom: 16px;
      }
      @media (hover: none) {
        .btn-hover {
          opacity: 1;
        }
      }
    `,
  ];
}
