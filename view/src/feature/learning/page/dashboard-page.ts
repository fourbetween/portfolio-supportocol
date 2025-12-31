import { Task } from "@lit/task";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { client } from "../api/client";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import type { Discussion } from "../model/discussion";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  @state()
  private _discussions: Discussion[] = [];

  @state()
  private _selectedDiscussion?: Discussion;

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

  private async _handleSelectDiscussion(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
  }

  private _handleDiscussionUpdated(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
    this.discussionsTask.run();
  }

  render() {
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
              .discussion=${this._selectedDiscussion}
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
