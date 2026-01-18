import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyle } from "../../../shared/style/base";
import { buttonStyle } from "../../../shared/style/button";
import { iconStyle } from "../../../shared/style/icon";
import type { CommentFrame } from "../model/comment-frame";
import "../ui/comment-reply-form/comment-reply-form";

@customElement("dialogue-comment-create-widget")
export class DialogueCommentCreateWidget extends LitElement {
  @property({ type: Object })
  frame?: CommentFrame;

  @state()
  private isCreating = false;

  private get rootAvailableTypes() {
    return (
      this.frame?.paths.filter((p) => p.parent === "").map((p) => p.child) || []
    );
  }

  private handleStart() {
    this.isCreating = true;
  }

  private handleCancel() {
    this.isCreating = false;
  }

  render() {
    if (!this.frame || this.rootAvailableTypes.length === 0) return nothing;

    if (this.isCreating) {
      return html`
        <div class="form-wrapper">
          <dialogue-comment-reply-form
            .parentCommentId=${null}
            .parentCommentType=${""}
            .frame=${this.frame}
            @dialogue-comment-create=${() => (this.isCreating = false)}
            @dialogue-comment-create-cancel=${this.handleCancel}
          ></dialogue-comment-reply-form>
        </div>
      `;
    }

    return html`
      <button class="btn add-button" @click=${this.handleStart}>
        <span class="material-symbols-outlined">add_comment</span>
        <span>New Comment</span>
      </button>
    `;
  }

  static styles = [
    baseStyle,
    buttonStyle,
    iconStyle,
    css`
      :host {
        display: block;
        padding: 8px 0;
      }
      .add-button {
        color: var(--color-fg-muted);
        border: 1px dashed var(--color-border-default);
        width: 100%;
        justify-content: flex-start;
        background: transparent;
      }
      .add-button:hover {
        background-color: var(--color-canvas-subtle);
        border-style: solid;
      }
    `,
  ];
}
