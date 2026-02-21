import { consume } from "@lit/context";
import { msg } from "@lit/localize";
import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { workspaceContext } from "../../../app/context/workspace";
import { TouchController } from "../../../app/controller/touch";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { hoverButtonStyle } from "../../../shared/style/hover-button";
import { iconStyle } from "../../../shared/style/icon";
import { titleStyle } from "../../../shared/style/title";
import "../../../shared/ui/drawer/drawer";
import "../../workspace/component/project-select-widget";
import { type WorkspaceProjectSelectEvent } from "../../workspace/event/project";
import type { WorkspaceWithMember } from "../../workspace/model/workspace";
import "../component/comment-explorer-widget";
import "../component/comment-frame-widget";
import "../component/comment-issue-widget";
import "../component/comment-proposed-widget";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import {
  type LearningCommentCreatedEvent,
  type LearningCommentDeletedEvent,
  type LearningCommentSelectEvent,
  type LearningCommentUpdatedEvent,
} from "../event/comment";
import {
  type LearningDiscussionArchiveFilterEvent,
  type LearningDiscussionDeletedEvent,
  type LearningDiscussionSelectEvent,
  type LearningDiscussionUpdatedEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import type { Discussion, DiscussionSummary } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";

const PROJECT_ID_STORAGE_KEY = "learning:selected-project-id";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  private _touch = new TouchController(this);

  @consume({ context: workspaceContext, subscribe: true })
  private workspace?: WorkspaceWithMember;

  @state()
  private _summaries: DiscussionSummary[] = [];

  @state()
  private _comments: Comment[] = [];

  @state()
  private _selectedProjectId?: string;

  @state()
  private _selectedDiscussionId?: string;

  @state()
  private _selectedDiscussion?: Discussion;

  @state()
  private _selectedCommentId?: string;

  @state()
  private _showArchived = false;

  @state()
  private _activeDrawer?: "left" | "right";

  private summariesTask = new Task(this, {
    task: async ([workspace, projectId, showArchived]) => {
      if (!workspace || !projectId) return [] as DiscussionSummary[];
      return discussionRepository.list(
        workspace.workspace.id,
        projectId,
        showArchived as boolean,
      );
    },
    onComplete: (summaries) => {
      this._summaries = summaries as DiscussionSummary[];
    },
    onError: (e: unknown) => {
      showToast(this, String(e), "error");
    },
    args: () => [this.workspace, this._selectedProjectId, this._showArchived],
  });

  constructor() {
    super();

    new Task(this, {
      task: async ([workspace, discussionId]) => {
        if (!workspace || !discussionId) return;
        return discussionRepository.get(workspace.workspace.id, discussionId);
      },
      onComplete: (discussion) => {
        this._selectedDiscussion = discussion;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspace, this._selectedDiscussionId],
    });

    new Task(this, {
      task: async ([workspace, discussionId]) => {
        if (!workspace || !discussionId) return [] as Comment[];
        return commentRepository.list(workspace.workspace.id, discussionId);
      },
      onComplete: (comments) => {
        this._comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.workspace, this._selectedDiscussionId],
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      this._selectedDiscussionId = id;
    } else if (this._touch.isTouchDevice) {
      this._activeDrawer = "left";
    }

    const savedProjectId = localStorage.getItem(PROJECT_ID_STORAGE_KEY);
    if (savedProjectId) {
      this._selectedProjectId = savedProjectId;
    }

    window.addEventListener("popstate", this._handlePopState);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this._handlePopState);
  }

  private _handlePopState = () => {
    const params = new URLSearchParams(window.location.search);
    this._selectedDiscussionId = params.get("id") || undefined;
    if (!this._selectedDiscussionId && this._touch.isTouchDevice) {
      this._activeDrawer = "left";
    }
  };

  private _handleProjectSelect(e: WorkspaceProjectSelectEvent) {
    this._selectedProjectId = e.projectId;
    if (e.projectId) {
      localStorage.setItem(PROJECT_ID_STORAGE_KEY, e.projectId);
    } else {
      localStorage.removeItem(PROJECT_ID_STORAGE_KEY);
    }
  }

  private _handleDiscussionSelect(e: LearningDiscussionSelectEvent) {
    if (this._selectedDiscussionId === e.discussionId) {
      return;
    }
    this._selectedDiscussionId = e.discussionId;
    const url = new URL(window.location.href);
    url.searchParams.set("id", e.discussionId);
    window.history.pushState({}, "", url);
    this._activeDrawer = undefined;
  }

  private _handleArchiveFilter(e: LearningDiscussionArchiveFilterEvent) {
    this._showArchived = e.archived;
  }

  private _handleDiscussionUpdated(e: LearningDiscussionUpdatedEvent) {
    this._selectedDiscussionId = e.discussion.id;
    this._selectedDiscussion = e.discussion;
    this._activeDrawer = undefined;
    this.summariesTask.run();
  }

  private _handleDiscussionDeleted(e: LearningDiscussionDeletedEvent) {
    if (this._selectedDiscussionId === e.discussionId) {
      this._selectedDiscussionId = undefined;
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.pushState({}, "", url);

      if (this._touch.isTouchDevice) {
        this._activeDrawer = "left";
      }
    }
    this._summaries = this._summaries.filter((d) => d.id !== e.discussionId);
  }

  private _handleCommentCreated(e: LearningCommentCreatedEvent) {
    this._comments = [...this._comments, e.comment];
  }

  private _handleCommentUpdated(e: LearningCommentUpdatedEvent) {
    const oldComment = this._comments.find((c) => c.id === e.comment.id);
    this._comments = this._comments.map((c) =>
      c.id === e.comment.id ? e.comment : c,
    );
    if (oldComment?.status === "proposed" && e.comment.status === "active") {
      this._selectedCommentId = e.comment.id;
      this._activeDrawer = undefined;
    }
  }

  private _handleCommentDeleted(e: LearningCommentDeletedEvent) {
    this._comments = this._comments.filter((c) => c.id !== e.commentId);
    if (this._selectedCommentId === e.commentId) {
      this._selectedCommentId = undefined;
    }
  }

  private _handleCommentSelect(e: LearningCommentSelectEvent) {
    this._selectedCommentId = e.commentId;
  }

  private get _hasProposedComments() {
    return this._comments.some((c) => c.status === "proposed");
  }

  private get _hasCommentsWithIssues() {
    return this._comments.some((c) => c.issues && c.issues.length > 0);
  }

  private get _hasRightSidebarContent() {
    return this._hasProposedComments || this._hasCommentsWithIssues;
  }

  private _handleCommentGenerated() {
    setTimeout(async () => {
      if (!this.isConnected || !this._selectedDiscussionId) return;

      const since =
        this._comments.length > 0
          ? this._comments.reduce(
              (max, c) => (c.createdAt > max ? c.createdAt : max),
              this._comments[0].createdAt,
            )
          : undefined;

      try {
        if (!this.workspace) return;

        const newComments = await commentRepository.list(
          this.workspace.workspace.id,
          this._selectedDiscussionId,
          since,
        );
        const existingIds = new Set(this._comments.map((c) => c.id));
        const filteredNewComments = newComments.filter(
          (c) => !existingIds.has(c.id),
        );

        if (filteredNewComments.length > 0) {
          this._comments = [...this._comments, ...filteredNewComments];
        }
      } catch (e) {
        showToast(this, String(e), "error");
      }
    }, 15000);
  }

  private _renderDiscussionList() {
    return html`
      <learning-discussion-list-widget
        .summaries=${this._summaries}
        .projectId=${this._selectedProjectId}
        @learning-discussion-select=${this._handleDiscussionSelect}
        @learning-discussion-created=${this._handleDiscussionUpdated}
        @learning-discussion-deleted=${this._handleDiscussionDeleted}
        @learning-discussion-archive-filter=${this._handleArchiveFilter}
      ></learning-discussion-list-widget>
    `;
  }

  private _renderRightSidebarContent() {
    return html`
      <learning-comment-proposed-widget
        .discussionId=${this._selectedDiscussionId}
        .comments=${this._comments}
        @learning-comment-updated=${this._handleCommentUpdated}
        @learning-comment-deleted=${this._handleCommentDeleted}
        @learning-comment-select=${this._handleCommentSelect}
      ></learning-comment-proposed-widget>
      <learning-comment-issue-widget
        .comments=${this._comments}
        @learning-comment-select=${this._handleCommentSelect}
      ></learning-comment-issue-widget>
    `;
  }

  private _renderLeftSidebar(isTouch: boolean) {
    const projectSelect = html`
      <div class="sidebar-project-select">
        <div class="section-title">${msg("Projects")}</div>
        <workspace-project-select-widget
          .selectedProjectId=${this._selectedProjectId ?? ""}
          @workspace-project-select=${this._handleProjectSelect}
        ></workspace-project-select-widget>
      </div>
    `;
    const list = this._renderDiscussionList();
    if (isTouch) {
      return html`
        <ui-drawer
          placement="left"
          .open=${this._activeDrawer === "left"}
          @drawer-close=${() => (this._activeDrawer = undefined)}
        >
          <span slot="header">${msg("Discussions")}</span>
          ${projectSelect} ${list}
        </ui-drawer>
      `;
    }
    return html`
      <aside class="sidebar sidebar-left">${projectSelect} ${list}</aside>
    `;
  }

  private _renderRightSidebar(isTouch: boolean) {
    if (!this._hasRightSidebarContent) return nothing;

    const content = this._renderRightSidebarContent();
    if (isTouch) {
      return html`
        <ui-drawer
          placement="right"
          .open=${this._activeDrawer === "right"}
          @drawer-close=${() => (this._activeDrawer = undefined)}
        >
          <span slot="header">${msg("Proposed / Issues")}</span>
          ${content}
        </ui-drawer>
      `;
    }
    return html`
      <aside class="sidebar sidebar-right">${content}</aside>
    `;
  }

  private _renderMainContent() {
    return html`
      <main class="main">
        <div class="detail">
          <learning-discussion-detail-widget
            .discussion=${this._selectedDiscussion}
            .comments=${this._comments}
            @learning-discussion-updated=${this._handleDiscussionUpdated}
          ></learning-discussion-detail-widget>
        </div>
        <div class="comment-frame">
          <learning-comment-frame-widget
            .comments=${this._comments}
          ></learning-comment-frame-widget>
        </div>
        <div class="comment-explorer">
          <learning-comment-explorer-widget
            .discussionId=${this._selectedDiscussionId}
            .comments=${this._comments}
            .selectedCommentId=${this._selectedCommentId}
            @learning-comment-created=${this._handleCommentCreated}
            @learning-comment-updated=${this._handleCommentUpdated}
            @learning-comment-deleted=${this._handleCommentDeleted}
            @learning-comment-generated=${this._handleCommentGenerated}
            @learning-comment-select=${this._handleCommentSelect}
          ></learning-comment-explorer-widget>
        </div>
      </main>
    `;
  }

  private _renderFABs() {
    if (!this._touch.isTouchDevice) return nothing;

    return html`
      <button
        class="btn-hover btn-left"
        @click=${() => (this._activeDrawer = "left")}
      >
        <span class="material-symbols-outlined">menu</span>
      </button>
      ${this._hasRightSidebarContent
        ? html`
            <button
              class="btn-hover btn-right"
              @click=${() => (this._activeDrawer = "right")}
            >
              <span class="material-symbols-outlined">reviews</span>
            </button>
          `
        : nothing}
    `;
  }

  render() {
    const isTouch = this._touch.isTouchDevice;

    return html`
      <div class="dashboard hover-container">
        ${this._renderLeftSidebar(isTouch)} ${this._renderMainContent()}
        ${this._renderRightSidebar(isTouch)} ${this._renderFABs()}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    hoverButtonStyle,
    titleStyle,
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
      .sidebar-left {
        border-right: 1px solid var(--color-border-default);
      }
      .sidebar-right {
        border-left: 1px solid var(--color-border-default);
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .sidebar-project-select {
        padding: 16px;
        border-bottom: 1px solid var(--color-border-default);
      }
      .main {
        flex: 1;
        display: flex;
        gap: 16px;
        flex-direction: column;
        overflow-y: auto;
        padding-bottom: 24px;
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
      }
      .btn-hover .material-symbols-outlined {
        font-size: 24px;
      }
      .btn-left {
        left: 16px;
        bottom: 16px; /* fallback */
        bottom: calc(16px + env(safe-area-inset-bottom));
      }
      .btn-right {
        right: 16px;
        bottom: 16px; /* fallback */
        bottom: calc(16px + env(safe-area-inset-bottom));
      }
      @media (hover: none) {
        .btn-hover {
          opacity: 1;
        }
      }
    `,
  ];
}
