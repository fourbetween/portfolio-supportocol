import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Discussion } from "../../../../model/discussion";
import type { Project } from "../../../../model/project";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import {
  dangerButtonStyle,
  listItemStyle,
  pageContainerStyle,
  pageHeaderStyle,
  pageHeadingStyle,
  pageHostStyle,
  sectionStyle,
} from "../../../../style/page";

@customElement("item-project-page-presenter")
export class ItemProjectPagePresenter extends LitElement {
  @property({ attribute: false })
  project?: Project;

  @property({ attribute: false })
  discussions: Discussion[] = [];

  @property({ attribute: false })
  getDiscussionLink?: (id: string) => string;

  @property({ attribute: false })
  onCreateDiscussion?: () => void;

  @property({ attribute: false })
  onEditProject?: () => void;

  @property({ attribute: false })
  onDeleteProject?: () => void;

  private handleCreateDiscussion() {
    this.onCreateDiscussion?.();
  }

  private handleEditProject() {
    this.onEditProject?.();
  }

  private handleDeleteProject() {
    this.onDeleteProject?.();
  }

  render() {
    return html`
      <main class="container container--wide">
        <header class="page-header">
          <h1>${this.project?.name ?? ""}</h1>
          <div class="header-actions">
            <button class="btn-secondary" @click=${this.handleEditProject}>
              編集
            </button>
            <button class="btn-danger" @click=${this.handleDeleteProject}>
              削除
            </button>
          </div>
        </header>
        <section class="section">
          <div class="section-header">
            <h2>議論</h2>
            <button class="btn-primary" @click=${this.handleCreateDiscussion}>
              新規議論
            </button>
          </div>
          <ul class="list">
            ${this.discussions.length === 0
              ? html`
                  <li class="empty-message">議論がありません</li>
                `
              : this.discussions.map(
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

  static styles = [
    baseStyle,
    buttonStyle,
    pageHostStyle,
    pageContainerStyle,
    pageHeadingStyle,
    pageHeaderStyle,
    sectionStyle,
    listItemStyle,
    dangerButtonStyle,
  ];
}
