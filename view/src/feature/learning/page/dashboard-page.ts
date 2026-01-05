import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../component/comment-explorer-widget";
import "../component/comment-frame-widget";
import "../component/comment-proposed-widget";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import {
  COMMENT_CREATED_EVENT_NAME,
  COMMENT_DELETED_EVENT_NAME,
  COMMENT_GENERATED_EVENT_NAME,
  COMMENT_UPDATED_EVENT_NAME,
  SELECT_COMMENT_EVENT_NAME,
  type CommentCreatedEvent,
  type CommentDeletedEvent,
  type CommentUpdatedEvent,
  type SelectCommentEvent,
} from "../event/comment";
import {
  DISCUSSION_CREATED_EVENT_NAME,
  DISCUSSION_DELETED_EVENT_NAME,
  DISCUSSION_UPDATED_EVENT_NAME,
  SELECT_DISCUSSION_EVENT_NAME,
  type DiscussionDeletedEvent,
  type DiscussionUpdatedEvent,
  type SelectDiscussionEvent,
} from "../event/discussion";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import { commentRepository } from "../repository/comment-repository";
import { discussionRepository } from "../repository/discussion-repository";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  @state()
  private _discussions: Discussion[] = [];

  @state()
  private _comments: Comment[] = [];

  @state()
  private _selectedDiscussionId?: string;

  @state()
  private _selectedCommentId?: string;

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        return await discussionRepository.list();
      },
      onComplete: (discussions) => {
        this._discussions = discussions;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [],
    });

    new Task(this, {
      task: async () => {
        if (!this._selectedDiscussionId) return [] as Comment[];
        return await commentRepository.list(this._selectedDiscussionId);
      },
      onComplete: (comments) => {
        this._comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this._selectedDiscussionId],
    });
  }

  connectedCallback() {
    super.connectedCallback();
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      this._selectedDiscussionId = id;
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
  };

  private _handleSelectDiscussion(e: SelectDiscussionEvent) {
    if (this._selectedDiscussionId === e.discussion.id) return;
    this._selectedDiscussionId = e.discussion.id;
    const url = new URL(window.location.href);
    url.searchParams.set("id", e.discussion.id);
    window.history.pushState({}, "", url);
  }

  private _handleDiscussionUpdated(e: DiscussionUpdatedEvent) {
    this._selectedDiscussionId = e.discussion.id;
    const exists = this._discussions.some((d) => d.id === e.discussion.id);
    if (exists) {
      this._discussions = this._discussions.map((d) =>
        d.id === e.discussion.id ? e.discussion : d
      );
    } else {
      this._discussions = [...this._discussions, e.discussion];
    }
  }

  private _handleDiscussionDeleted(e: DiscussionDeletedEvent) {
    if (this._selectedDiscussionId === e.discussion.id) {
      this._selectedDiscussionId = undefined;
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.pushState({}, "", url);
    }
    this._discussions = this._discussions.filter(
      (d) => d.id !== e.discussion.id
    );
  }

  private _handleCommentCreated(e: CommentCreatedEvent) {
    this._comments = [...this._comments, e.comment];
  }

  private _handleCommentUpdated(e: CommentUpdatedEvent) {
    const oldComment = this._comments.find((c) => c.id === e.comment.id);
    this._comments = this._comments.map((c) =>
      c.id === e.comment.id ? e.comment : c
    );
    if (oldComment?.status === "proposed" && e.comment.status === "active") {
      this._selectedCommentId = e.comment.id;
    }
  }

  private _handleCommentDeleted(e: CommentDeletedEvent) {
    this._comments = this._comments.filter((c) => c.id !== e.commentId);
    if (this._selectedCommentId === e.commentId) {
      this._selectedCommentId = undefined;
    }
  }

  private _handleSelectComment(e: SelectCommentEvent) {
    this._selectedCommentId = e.commentId;
  }

  private _handleCommentGenerated() {
    setTimeout(async () => {
      if (!this.isConnected || !this._selectedDiscussionId) return;

      const since =
        this._comments.length > 0
          ? this._comments.reduce(
              (max, c) => (c.createdAt > max ? c.createdAt : max),
              this._comments[0].createdAt
            )
          : undefined;

      try {
        const newComments = await commentRepository.list(
          this._selectedDiscussionId,
          since
        );
        const existingIds = new Set(this._comments.map((c) => c.id));
        const filteredNewComments = newComments.filter(
          (c) => !existingIds.has(c.id)
        );

        if (filteredNewComments.length > 0) {
          this._comments = [...this._comments, ...filteredNewComments];
        }
      } catch (e) {
        showToast(this, String(e), "error");
      }
    }, 15000);
  }

  render() {
    const selectedDiscussion = this._discussions.find(
      (d) => d.id === this._selectedDiscussionId
    );
    const activeComments = this._comments.filter((c) => c.status === "active");
    const hasProposedComments = this._comments.some(
      (c) => c.status === "proposed"
    );

    return html`
      <div class="dashboard">
        <aside class="sidebar sidebar-left">
          <learning-discussion-list-widget
            .discussions=${this._discussions}
            @select-discussion=${this._handleSelectDiscussion}
            @${SELECT_DISCUSSION_EVENT_NAME}=${this._handleSelectDiscussion}
            @${DISCUSSION_CREATED_EVENT_NAME}=${this._handleDiscussionUpdated}
            @${DISCUSSION_DELETED_EVENT_NAME}=${this._handleDiscussionDeleted}
          ></learning-discussion-list-widget>
        </aside>
        <main class="main">
          <div class="detail">
            <learning-discussion-detail-widget
              .discussion=${selectedDiscussion}
              .comments=${activeComments}
              @${DISCUSSION_UPDATED_EVENT_NAME}=${this._handleDiscussionUpdated}
            ></learning-discussion-detail-widget>
          </div>
          <div class="comment-frame">
            <learning-comment-frame-widget
              .comments=${activeComments}
            ></learning-comment-frame-widget>
          </div>
          <div class="comment-explorer">
            <learning-comment-explorer-widget
              .discussionId=${this._selectedDiscussionId}
              .comments=${activeComments}
              .selectedCommentId=${this._selectedCommentId}
              @${COMMENT_CREATED_EVENT_NAME}=${this._handleCommentCreated}
              @${COMMENT_UPDATED_EVENT_NAME}=${this._handleCommentUpdated}
              @${COMMENT_DELETED_EVENT_NAME}=${this._handleCommentDeleted}
              @${COMMENT_GENERATED_EVENT_NAME}=${this._handleCommentGenerated}
              @${SELECT_COMMENT_EVENT_NAME}=${this._handleSelectComment}
            ></learning-comment-explorer-widget>
          </div>
        </main>
        ${hasProposedComments
          ? html`
              <aside class="sidebar sidebar-right">
                <learning-comment-proposed-widget
                  .discussionId=${this._selectedDiscussionId}
                  .comments=${this._comments}
                  @${COMMENT_UPDATED_EVENT_NAME}=${this._handleCommentUpdated}
                  @${COMMENT_DELETED_EVENT_NAME}=${this._handleCommentDeleted}
                  @${SELECT_COMMENT_EVENT_NAME}=${this._handleSelectComment}
                ></learning-comment-proposed-widget>
              </aside>
            `
          : nothing}
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      :host {
        display: block;
        height: 100%;
      }
      .dashboard {
        display: flex;
        height: 100%;
        overflow: hidden;
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
      .comment-proposed,
      .comment-explorer {
        padding: 0 16px;
      }
      .detail {
        border-bottom: 1px solid var(--color-border-default);
      }
    `,
  ];
}
