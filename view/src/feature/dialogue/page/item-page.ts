import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { userContext } from "../../../app/context/user";
import { TouchController } from "../../../app/controller/touch";
import type { User } from "../../../app/model/user";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/drawer/drawer";
import "../component/comment-explorer-widget";
import {
  type DialogueCommentCreatedEvent,
  type DialogueCommentSelectEvent,
  type DialogueCommentUpdatedEvent,
} from "../event/comment";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/comment-frame-detail";
import "../ui/comment-list";
import "../ui/discussion-detail";

@customElement("dialogue-item-page")
export class DialogueItemPage extends LitElement {
  private _touch = new TouchController(this);

  @property({ type: String })
  workspaceId!: string;

  @property({ type: String })
  discussionId!: string;

  @consume({ context: userContext, subscribe: true })
  @state()
  private _user?: User;

  @state()
  private _discussion?: Discussion;

  @state()
  private _comments: Comment[] = [];

  @state()
  private _selectedCommentId?: string;

  @state()
  private _isRightDrawerOpen = false;

  constructor() {
    super();

    new Task(this, {
      task: async ([workspaceId, discussionId]) => {
        return discussionRepository.load(workspaceId, discussionId);
      },
      onComplete: (discussion) => {
        this._discussion = discussion;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspaceId, this.discussionId],
    });

    new Task(this, {
      task: async ([workspaceId, discussionId]) => {
        if (!workspaceId || !discussionId) return [] as Comment[];
        return commentRepository.list(workspaceId, discussionId);
      },
      onComplete: (comments) => {
        this._comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspaceId, this.discussionId],
    });
  }

  private _handleCommentSelect(e: DialogueCommentSelectEvent) {
    this._selectedCommentId = e.commentId;
  }

  private _handleCommentCreated(e: DialogueCommentCreatedEvent) {
    this._comments = [...this._comments, e.comment];
  }

  private _handleCommentUpdated(e: DialogueCommentUpdatedEvent) {
    this._comments = this._comments.map((c) =>
      c.id === e.comment.id ? e.comment : c,
    );
  }

  private _renderRightSidebar(isTouch: boolean) {
    const list = html`
      <dialogue-comment-list
        .comments=${this._comments}
        @dialogue-comment-select=${this._handleCommentSelect}
      ></dialogue-comment-list>
    `;

    if (isTouch) {
      return html`
        <ui-drawer
          placement="right"
          .open=${this._isRightDrawerOpen}
          @drawer-close=${() => (this._isRightDrawerOpen = false)}
        >
          <span slot="header">${msg("Latest first")}</span>
          <section>${list}</section>
        </ui-drawer>
      `;
    }

    return html`
      <aside class="sidebar sidebar-right">
        <section>
          <div class="section-title">${msg("Latest first")}</div>
          ${list}
        </section>
      </aside>
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
            .frame=${this._discussion?.dialogueSettings.commentFrame}
          ></dialogue-comment-frame-detail>
        </div>
        <div class="comment-explorer">
          <dialogue-comment-explorer-widget
            .discussion=${this._discussion}
            .comments=${this._comments}
            .selectedCommentId=${this._selectedCommentId}
            .readonly=${!!this._discussion?.archivedAt}
            .isAuthenticated=${!!this._user}
            @dialogue-comment-select=${this._handleCommentSelect}
            @dialogue-comment-created=${this._handleCommentCreated}
            @dialogue-comment-updated=${this._handleCommentUpdated}
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
    titleStyle,
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
      section {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        border-radius: 6px;
      }
      @media (hover: none) {
        .btn-hover {
          opacity: 1;
        }
      }
    `,
  ];
}
