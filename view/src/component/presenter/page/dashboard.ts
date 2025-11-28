import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../model/discussion";
import type { Project } from "../../../model/project";
import { baseStyle } from "../../../style/base";
import { buttonStyle } from "../../../style/button";
import {
  listItemStyle,
  pageContainerStyle,
  pageHeadingStyle,
  pageHostStyle,
  sectionStyle,
} from "../../../style/page";

@customElement("dashboard-page-presenter")
export class DashboardPagePresenter extends LitElement {
  @property({ attribute: false })
  projects: Project[] = [];

  @property({ attribute: false })
  recentDiscussions: Discussion[] = [];

  @property({ attribute: false })
  onCreateProject?: () => void;

  @property({ attribute: false })
  getProjectLink?: (id: string) => string;

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  render() {
    return html`
      <main class="container container--wide">
        <h1>ダッシュボード</h1>
        <section class="section">
          <div class="section-header">
            <h2>プロジェクト</h2>
            <button class="btn-primary" @click=${this.handleCreateProject}>
              新規プロジェクト
            </button>
          </div>
          <ul class="list">
            ${this.projects.length === 0
              ? html`
                  <li class="empty-message">プロジェクトがありません</li>
                `
              : this.projects.map(
                  (project) => html`
                    <li class="list-item">
                      <a
                        class="list-item-link"
                        href=${this.getProjectLink?.(project.id) ?? "#"}
                      >
                        <span class="list-item-title">${project.name}</span>
                      </a>
                    </li>
                  `
                )}
          </ul>
        </section>
        <section class="section">
          <h2>最近の議論</h2>
          <ul class="list">
            ${this.recentDiscussions.length === 0
              ? html`
                  <li class="empty-message">最近の議論がありません</li>
                `
              : this.recentDiscussions.map(
                  (discussion) => html`
                    <li class="list-item">
                      <a
                        class="list-item-link"
                        href=${this.getDiscussionLink?.(discussion.id) ?? "#"}
                      >
                        <span class="list-item-title">${discussion.theme}</span>
                      </a>
                    </li>
                  `
                )}
          </ul>
        </section>
      </main>
    `;
  }

  private handleCreateProject() {
    this.onCreateProject?.();
  }

  static styles = [
    baseStyle,
    buttonStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    sectionStyle,
    listItemStyle,
  ];
}
