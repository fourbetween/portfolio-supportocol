import { Task } from "@lit/task";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import type { Discussion } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import "../ui/discussion-list/discussion-list";
import { baseStyle } from "../../../shared/style/base";

@customElement("dialogue-discussion-list-widget")
export class DialogueDiscussionListWidget extends LitElement {
  @property({ type: Array })
  discussions: Discussion[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async () => {
        return await discussionRepository.list();
      },
      onComplete: (discussions) => {
        this.discussions = discussions;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [],
    });
  }

  render() {
    return html`
      <dialogue-discussion-list
        .discussions=${this.discussions}
      ></dialogue-discussion-list>
    `;
  }

  static styles = [baseStyle, css``];
}
