import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import type { PageChangeEvent } from "../../../shared/event/page";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { widgetStyle } from "../../../shared/style/widget";
import "../../../shared/ui/pagination/pagination";
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

  @property({ type: Number })
  pageSize = 20;

  @property({ type: Boolean })
  paginated = true;

  @state()
  private sort: DiscussionSort = "lastCommentedAt";

  @state()
  private page = 1;

  @state()
  private totalCount = 0;

  constructor() {
    super();

    new Task(this, {
      task: async ([sort, page, pageSize]) => {
        return discussionRepository.list(sort, page, pageSize);
      },
      onComplete: (result) => {
        this.summaries = result.items;
        this.totalCount = result.totalCount;
        this.page = result.page;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.sort, this.page, this.pageSize] as const,
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
    this.page = 1;
  }

  private handlePageChange(event: PageChangeEvent) {
    this.page = event.page;
  }

  render() {
    return html`
      <div
        class="container-tight"
        @dialogue-discussion-select=${this.handleDiscussionSelect}
      >
        <div class="toolbar">
          <dialogue-discussion-sort-selector
            .sort=${this.sort}
            @dialogue-discussion-sort-change=${this.handleSortChange}
          ></dialogue-discussion-sort-selector>
        </div>
        <dialogue-discussion-list
          .summaries=${this.summaries}
        ></dialogue-discussion-list>
        ${this.paginated
          ? html`
              <ui-pagination
                .page=${this.page}
                .pageSize=${this.pageSize}
                .totalCount=${this.totalCount}
                @page-change=${this.handlePageChange}
              ></ui-pagination>
            `
          : ""}
      </div>
    `;
  }

  static styles = [baseStyle, widgetStyle];
}
