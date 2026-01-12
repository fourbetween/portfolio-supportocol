import { Task } from "@lit/task";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { showToast } from "../../../shared/event/toast";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import type { Comment } from "../model/comment";
import type { Discussion } from "../model/discussion";
import { discussionRepository } from "../repository/discussion-repository";
import { commentRepository } from "../repository/comment-repository";

@customElement("dialogue-item-page")
export class DialogueItemPage extends LitElement {
  @property({ type: String })
  discussionId!: string;

  @state()
  private _discussion?: Discussion;

  @state()
  private _comments: Comment[] = [];

  constructor() {
    super();

    new Task(this, {
      task: async ([discussionId]) => {
        return await discussionRepository.load(discussionId);
      },
      onComplete: (discussion) => {
        this._discussion = discussion;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.discussionId],
    });

    new Task(this, {
      task: async ([discussionId]) => {
        if (!discussionId) return [] as Comment[];
        return await commentRepository.list(discussionId);
      },
      onComplete: (comments) => {
        this._comments = comments;
      },
      onError: (e: unknown) => {
        showToast(this, String(e), "error");
      },
      args: () => [this.discussionId],
    });
  }

  render() {
    if (!this._discussion) return nothing;

    return html``;
  }

  static styles = [baseStyle, buttonStyle, css``];
}
