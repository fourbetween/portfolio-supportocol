import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyle } from "../../../../shared/style/base";
import "../../../../shared/ui/popup/popup";
import type { CommentIssue } from "../../model/comment";
import "../issue-list/issue-list";

@customElement("learning-issue-list-popup")
export class LearningIssueListPopup extends LitElement {
  @property({ type: String })
  commentId = "";

  @property({ type: Boolean })
  open = false;

  @property({ type: Array })
  issues: CommentIssue[] = [];

  @property({ type: Boolean })
  readonly = false;

  render() {
    return html`
      <ui-popup .open=${this.open}>
        <div slot="header">Issues</div>
        <div slot="main">
          <learning-issue-list
            .commentId=${this.commentId}
            .issues=${this.issues}
            .readonly=${this.readonly}
          ></learning-issue-list>
        </div>
      </ui-popup>
    `;
  }

  static styles = [baseStyle];
}
