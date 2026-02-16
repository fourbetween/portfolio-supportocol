import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type {
  DialogueDiscussionSelectEvent,
  DialogueDiscussionSortChangeEvent,
} from "../event/discussion";
import type { DiscussionSort, DiscussionSummary } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-list";
import "../ui/discussion-sort-selector";

@customElement("dialogue-discussion-list-widget")
export class DialogueDiscussionListWidget extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  @state()
  private router?: Router;

  @property({ type: Array })
  summaries: DiscussionSummary[] = [];

  @state()
  private sort: DiscussionSort = "lastCommentedAt";

  constructor() {
    super();

    new Task(this, {
      task: async ([sort]) => {
        return discussionRepository.list(sort);
      },
      onComplete: (summaries) => {
        this.summaries = summaries;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.sort],
    });
  }

  private handleDiscussionSelect(event: DialogueDiscussionSelectEvent) {
    if (!this.router) return;
    navigate(this.router, paths.dialogue.item, {
      workspaceId: event.workspaceId,
      discussionId: event.discussionId,
    });
  }

  private handleSortChange(event: DialogueDiscussionSortChangeEvent) {
    this.sort = event.sort;
  }

  render() {
    return html`
      <div class="container">
        <div class="toolbar">
          <dialogue-discussion-sort-selector
            .sort=${this.sort}
            @dialogue-discussion-sort-change=${this.handleSortChange}
          ></dialogue-discussion-sort-selector>
        </div>
        <dialogue-discussion-list
          .summaries=${this.summaries}
          @dialogue-discussion-select=${this.handleDiscussionSelect}
        ></dialogue-discussion-list>
      </div>
    `;
  }

  static styles = [
    baseStyle,
    css`
      .container {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .toolbar {
        display: flex;
        justify-content: flex-end;
      }
    `,
  ];
}
