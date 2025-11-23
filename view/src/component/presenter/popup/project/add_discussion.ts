import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import type { Discussion } from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import { buttonStyle } from "../../../../style/button";
import { formStyle } from "../../../../style/form";
import type { BasePopupPresenter } from "../base";

@customElement("add-discussion-popup-presenter")
export class AddDiscussionPopupPresenter extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  @state()
  private selectedDiscussionIds: Set<string> = new Set();

  @query("base-popup-presenter")
  private basePopup!: BasePopupPresenter;

  open() {
    this.basePopup.open();
  }

  private toggleItem(discussionId: string) {
    const newSet = new Set(this.selectedDiscussionIds);
    if (newSet.has(discussionId)) {
      newSet.delete(discussionId);
    } else {
      newSet.add(discussionId);
    }
    this.selectedDiscussionIds = newSet;
  }

  private closePopup() {
    this.basePopup.close();
  }

  private addDiscussion() {
    alert(`${this.selectedDiscussionIds.size}件の議論を追加しました`);
    this.closePopup();
  }

  render() {
    return html`
      <base-popup-presenter>
        <span slot="header">既存の議論を追加</span>
        <div slot="main">
          <div class="form-group">
            <input
              type="text"
              class="form-control"
              placeholder="議論を検索..."
            />
          </div>
          <div class="search-results">
            ${map(this.discussions, (discussion) => {
              const isSelected = this.selectedDiscussionIds.has(discussion.id);
              return html`
                <div
                  class="result-item ${isSelected ? "selected" : ""}"
                  @click=${() => this.toggleItem(discussion.id)}
                >
                  <input
                    type="checkbox"
                    name="discussion"
                    style="pointer-events: none"
                    .checked=${isSelected}
                  />
                  <div>
                    <div class="discussion-title">${discussion.theme}</div>
                    <div class="discussion-meta">${discussion.status}</div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
        <div slot="footer" class="actions">
          <button class="btn" @click=${this.closePopup}>キャンセル</button>
          <button
            id="add-btn"
            class="btn btn-primary"
            @click=${this.addDiscussion}
            .disabled=${this.selectedDiscussionIds.size === 0}
          >
            追加
          </button>
        </div>
      </base-popup-presenter>
    `;
  }

  static styles = [
    baseStyle,
    formStyle,
    buttonStyle,
    css`
      .search-results {
        border: 1px solid var(--color-border-default);
        border-radius: 6px;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 16px;
      }

      .result-item {
        padding: 8px 12px;
        border-bottom: 1px solid var(--color-border-muted);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .result-item:last-child {
        border-bottom: none;
      }

      .result-item:hover {
        background-color: var(--color-canvas-subtle);
      }

      .result-item.selected {
        background-color: #ddf4ff;
      }

      .discussion-title {
        font-weight: 600;
        font-size: 14px;
      }

      .discussion-meta {
        font-size: 12px;
        color: var(--color-fg-muted);
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        width: 100%;
      }
    `,
  ];
}
