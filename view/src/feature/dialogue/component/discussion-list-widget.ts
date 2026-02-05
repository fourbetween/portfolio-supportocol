import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { routerContext } from "../../../app/context/router";
import { navigate, paths } from "../../../app/paths";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import type { DialogueDiscussionSelectEvent } from "../event/discussion";
import type { DiscussionSummary } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-list/discussion-list";

@customElement("dialogue-discussion-list-widget")
export class DialogueDiscussionListWidget extends LitElement {
  @consume({ context: routerContext, subscribe: true })
  @state()
  private router?: Router;

  @property({ type: Array })
  summaries: DiscussionSummary[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        return discussionRepository.list();
      },
      onComplete: (summaries) => {
        this.summaries = summaries;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [],
    });
  }

  private handleDiscussionSelect(event: DialogueDiscussionSelectEvent) {
    if (!this.router) return;
    navigate(this.router, paths.dialogue.item, {
      workspaceId: event.workspaceId,
      discussionId: event.discussionId,
    });
  }

  render() {
    return html`
      <dialogue-discussion-list
        .summaries=${this.summaries}
        @dialogue-discussion-select=${this.handleDiscussionSelect}
      ></dialogue-discussion-list>
    `;
  }

  static styles = [baseStyle, css``];
}
