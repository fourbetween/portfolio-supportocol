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

  private _handleSelectDiscussion(e: CustomEvent<Discussion>) {
    if (this._selectedDiscussionId === e.detail.id) return;
    this._selectedDiscussionId = e.detail.id;
    const url = new URL(window.location.href);
    url.searchParams.set("id", e.detail.id);
    window.history.pushState({}, "", url);
  }

  private _handleDiscussionUpdated(e: CustomEvent<Discussion>) {
    this._selectedDiscussionId = e.detail.id;
    const exists = this._discussions.some((d) => d.id === e.detail.id);
    if (exists) {
      this._discussions = this._discussions.map((d) =>
        d.id === e.detail.id ? e.detail : d
      );
    } else {
      this._discussions = [...this._discussions, e.detail];
    }
  }

  private _handleDiscussionDeleted(e: CustomEvent<Discussion>) {
    if (this._selectedDiscussionId === e.detail.id) {
      this._selectedDiscussionId = undefined;
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      window.history.pushState({}, "", url);
    }
    this._discussions = this._discussions.filter((d) => d.id !== e.detail.id);
  }

  private _handleCommentCreated(e: CustomEvent<Comment>) {
    this._comments = [...this._comments, e.detail];
  }

  private _handleCommentUpdated(e: CustomEvent<Comment>) {
    const oldComment = this._comments.find((c) => c.id === e.detail.id);
    this._comments = this._comments.map((c) =>
      c.id === e.detail.id ? e.detail : c
    );
    if (oldComment?.status === "proposed" && e.detail.status === "active") {
      this._selectedCommentId = e.detail.id;
    }
  }

  private _handleCommentDeleted(e: CustomEvent<{ id: string }>) {
    this._comments = this._comments.filter((c) => c.id !== e.detail.id);
    if (this._selectedCommentId === e.detail.id) {
      this._selectedCommentId = undefined;
    }
  }

  private _handleSelectComment(e: CustomEvent<{ id?: string }>) {
    this._selectedCommentId = e.detail.id;
  }

  private _handleCommentGenerated() {
    setTimeout(async () => {
      if (!this._selectedDiscussionId) return;

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
        if (newComments.length > 0) {
          const existingIds = new Set(this._comments.map((c) => c.id));
          const filteredNewComments = newComments.filter(
            (c) => !existingIds.has(c.id)
          );
          this._comments = [...this._comments, ...filteredNewComments];
        }
      } catch (e) {
        showToast(this, String(e), "error");
      }
    }, 10000);
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
            @discussion-created=${this._handleDiscussionUpdated}
            @discussion-deleted=${this._handleDiscussionDeleted}
          ></learning-discussion-list-widget>
        </aside>
        <main class="main">
          <div class="detail">
            <learning-discussion-detail-widget
              .discussion=${selectedDiscussion}
              .comments=${activeComments}
              @discussion-updated=${this._handleDiscussionUpdated}
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
              @comment-created=${this._handleCommentCreated}
              @comment-updated=${this._handleCommentUpdated}
              @comment-deleted=${this._handleCommentDeleted}
              @comment-generated=${this._handleCommentGenerated}
              @select-comment=${this._handleSelectComment}
            ></learning-comment-explorer-widget>
          </div>
        </main>
        ${hasProposedComments
          ? html`
              <aside class="sidebar sidebar-right">
                <learning-comment-proposed-widget
                  .discussionId=${this._selectedDiscussionId}
                  .comments=${this._comments}
                  @comment-updated=${this._handleCommentUpdated}
                  @comment-deleted=${this._handleCommentDeleted}
                  @select-comment=${this._handleSelectComment}
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
