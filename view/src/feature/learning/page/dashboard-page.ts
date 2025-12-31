import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { client } from "../api/client";
import "../component/comment-explorer-widget";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  @state()
  private _selectedDiscussion?: Discussion;

  @state()
  private _comments: Comment[] = [];

  private async _handleSelectDiscussion(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
    await this._fetchComments(this._selectedDiscussion.id);
  }

  private _handleDiscussionUpdated(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
  }

  private async _handleCommentSaved() {
    if (this._selectedDiscussion) {
      await this._fetchComments(this._selectedDiscussion.id);
    }
  }

  private async _fetchComments(discussionId: string) {
    const { data, error } = await client.GET(
      "/learning/discussions/{discussionId}/comments",
      {
        params: {
          path: { discussionId },
        },
      }
    );

    if (error) {
      showToast(this, "Failed to fetch comments.", "error");
      return;
    }

    this._comments = data || [];
  }

  render() {
    return html`
      <div class="dashboard">
        <aside class="sidebar">
          <learning-discussion-list-widget
            @select-discussion=${this._handleSelectDiscussion}
          ></learning-discussion-list-widget>
        </aside>
        <main class="main">
          <div class="detail">
            <learning-discussion-detail-widget
              .discussion=${this._selectedDiscussion}
              @discussion-updated=${this._handleDiscussionUpdated}
            ></learning-discussion-detail-widget>
          </div>
          <div class="explorer">
            <learning-comment-explorer-widget
              .discussion=${this._selectedDiscussion}
              .comments=${this._comments}
              @comment-saved=${this._handleCommentSaved}
            ></learning-comment-explorer-widget>
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
      .explorer {
        flex: 1;
      }
    `,
  ];
}
