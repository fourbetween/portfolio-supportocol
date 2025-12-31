import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import "../component/comment-explorer-widget";
import "../component/discussion-detail-widget";
import "../component/discussion-list-widget";
import type { Discussion } from "../model/discussion";

@customElement("learning-dashboard-page")
export class LearningDashboardPage extends LitElement {
  @state()
  private _selectedDiscussion?: Discussion;

  private async _handleSelectDiscussion(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
  }

  private _handleDiscussionUpdated(e: CustomEvent<Discussion>) {
    this._selectedDiscussion = e.detail;
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
