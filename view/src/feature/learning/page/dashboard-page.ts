import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { client } from "../api/client";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  @state()
  private _discussions: Discussion[] = [];

  @state()
  private _comments: Comment[] = [];

  @state()
  private _selectedDiscussionId?: string;

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        if (!this._selectedDiscussionId) return [] as Comment[];
        const { data, error } = await client.GET(
          "/learning/discussions/{discussionId}/comments",
          {
            params: {
              path: {
                discussionId: this._selectedDiscussionId || "",
              },
            },
          }
        );
        if (error) throw new Error(error.message);
        return data || [];
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
  }

  private discussionsTask = new Task(this, {
    task: async () => {
      const { data, error } = await client.GET("/learning/discussions");
      if (error) throw new Error(error.message);
      return data || [];
    },
    onComplete: (discussions) => {
      this._discussions = discussions;
    },
    onError: (e: unknown) => {
      showToast(this, String(e), "error");
    },
    args: () => [],
  });

  private _handleSelectDiscussion(e: CustomEvent<Discussion>) {
    if (this._selectedDiscussionId === e.detail.id) return;
    this._selectedDiscussionId = e.detail.id;
    const url = new URL(window.location.href);
    url.searchParams.set("id", e.detail.id);
    window.history.pushState({}, "", url);
  }

  private _handleDiscussionUpdated(e: CustomEvent<Discussion>) {
    this._selectedDiscussionId = e.detail.id;
    this.discussionsTask.run();
  }

  render() {
    const selectedDiscussion = this._discussions.find(
      (d) => d.id === this._selectedDiscussionId
    );

    return html`
      <div class="dashboard">
        <aside class="sidebar">
          <learning-discussion-list-widget
            .discussions=${this._discussions}
            @select-discussion=${this._handleSelectDiscussion}
          ></learning-discussion-list-widget>
        </aside>
        <main class="main">
          <div class="detail">
            <learning-discussion-detail-widget
              .discussion=${selectedDiscussion}
              .comments=${this._comments}
              @discussion-updated=${this._handleDiscussionUpdated}
            ></learning-discussion-detail-widget>
          </div>
        </main>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    css`
      .dashboard {
        display: flex;
        height: 100vh;
        overflow: hidden;
      }
      .sidebar {
        width: 300px;
        border-right: 1px solid var(--color-border-default);
        overflow-y: auto;
      }
      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
      }
      .detail {
        border-bottom: 1px solid var(--color-border-default);
      }
    `,
  ];
}
