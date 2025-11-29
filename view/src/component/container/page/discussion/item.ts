import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { client } from "../../../../api/client";
import { routerContext } from "../../../../context/router";
import { accountMethods } from "../../../../model/account";
import type {
  Comment,
  CommentStatus,
  CommentType,
  Discussion,
  Note,
} from "../../../../model/discussion";
import { baseStyle } from "../../../../style/base";
import type { ChangeStatusPopupPresenter } from "../../../presenter/popup/comment/change_status";
import type { CreateCommentPopupPresenter } from "../../../presenter/popup/comment/create";

@customElement("item-discussion-page-container")
export class ItemDiscussionPageContainer extends LitElement {
  @consume({ context: routerContext })
  @property({ attribute: false })
  router?: Router;

  @property({ type: String })
  discussionId = "";

  @state()
  private discussion?: Discussion;

  @state()
  private comments: Comment[] = [];

  @state()
  private commentTypes: CommentType[] = [];

  @state()
  private focusedCommentId: string | null = null;

  @state()
  private selectedCommentForStatus: Comment | null = null;

  @state()
  private parentCommentIdForCreate: string | null = null;

  @state()
  private convertingNote: Note | null = null;

  @state()
  private notes: Note[] = [];

  @query("create-comment-popup-presenter")
  private createCommentPopup!: CreateCommentPopupPresenter;

  @query("change-status-popup-presenter")
  private changeStatusPopup!: ChangeStatusPopupPresenter;

  constructor() {
    super();

    new Task(this, {
      task: async ([discussionId]) => {
        if (!discussionId) return undefined;
        const { data, error } = await client.GET(
          "/discussions/{discussionId}",
          {
            headers: await accountMethods.authHeader(),
            params: { path: { discussionId } },
          }
        );
        if (error) {
          throw new Error(error.message);
        }
        return data;
      },
      args: () => [this.discussionId] as const,
      onComplete: (data) => {
        this.discussion = data;
        if (data) {
          this.fetchRule(data.ruleId);
          this.fetchComments();
          this.fetchNotes();
        }
      },
    });
  }

  private async fetchRule(ruleId: string) {
    const { data, error } = await client.GET("/rules/{ruleId}", {
      headers: await accountMethods.authHeader(),
      params: { path: { ruleId } },
    });
    if (error) {
      console.error("Failed to fetch rule:", error.message);
      return;
    }
    this.commentTypes = data.commentTypes;
  }

  private async fetchComments() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/comments",
      {
        headers: await accountMethods.authHeader(),
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      console.error("Failed to fetch comments:", error.message);
      return;
    }
    this.comments = data;
  }

  private async fetchNotes() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/notes",
      {
        headers: await accountMethods.authHeader(),
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      console.error("Failed to fetch notes:", error.message);
      return;
    }
    this.notes = data;
  }

  render() {
    if (!this.discussion) {
      return nothing;
    }

    return html`
      <item-discussion-page-presenter
        .discussion=${this.discussion}
        .comments=${this.comments}
        .commentTypes=${this.commentTypes}
        .focusedCommentId=${this.focusedCommentId}
        .notes=${this.notes}
        .onAddComment=${this.handleAddComment}
        .onFocusComment=${this.handleFocusComment}
        .onClearFocus=${this.handleClearFocus}
        .onChangeStatus=${this.handleChangeStatusClick}
        .onCreateNote=${this.handleCreateNote}
        .onDeleteNote=${this.handleDeleteNote}
        .onConvertNoteToComment=${this.handleConvertNoteToComment}
      ></item-discussion-page-presenter>

      <create-comment-popup-presenter
        .commentTypes=${this.commentTypes}
        .parentCommentId=${this.parentCommentIdForCreate}
        .onCreate=${this.handleCreateComment}
      ></create-comment-popup-presenter>

      <change-status-popup-presenter
        .currentStatus=${this.selectedCommentForStatus?.status ?? "unassigned"}
        .onChangeStatus=${this.handleChangeStatus}
      ></change-status-popup-presenter>
    `;
  }

  private handleAddComment = (parentCommentId: string | null) => {
    this.parentCommentIdForCreate = parentCommentId;
    this.createCommentPopup.open();
  };

  private handleCreateComment = async (data: {
    commentTypeId: string;
    content: string;
  }) => {
    const { error } = await client.POST(
      "/discussions/{discussionId}/comments",
      {
        headers: await accountMethods.authHeader(),
        params: { path: { discussionId: this.discussionId } },
        body: {
          parentCommentId: this.parentCommentIdForCreate ?? "",
          commentTypeId: data.commentTypeId,
          content: data.content,
        },
      }
    );

    if (error) {
      console.error("Failed to create comment:", error.message);
      return;
    }

    // ノートからの変換の場合、元のノートを削除
    if (this.convertingNote) {
      await this.handleDeleteNote(this.convertingNote.id);
      this.convertingNote = null;
    }

    this.createCommentPopup.close();
    await this.fetchComments();
  };

  private handleFocusComment = (commentId: string) => {
    this.focusedCommentId = commentId;
  };

  private handleClearFocus = () => {
    this.focusedCommentId = null;
  };

  private handleChangeStatusClick = (commentId: string) => {
    const comment = this.comments.find((c) => c.id === commentId);
    if (comment) {
      this.selectedCommentForStatus = comment;
      this.changeStatusPopup.open();
    }
  };

  private handleChangeStatus = async (status: CommentStatus) => {
    if (!this.selectedCommentForStatus) return;

    const { error } = await client.PUT(
      "/discussions/{discussionId}/comments/{commentId}",
      {
        headers: await accountMethods.authHeader(),
        params: {
          path: {
            discussionId: this.discussionId,
            commentId: this.selectedCommentForStatus.id,
          },
        },
        body: {
          content: this.selectedCommentForStatus.content,
          status,
        },
      }
    );

    if (error) {
      console.error("Failed to update comment status:", error.message);
      return;
    }

    this.changeStatusPopup.close();
    await this.fetchComments();
  };

  private handleCreateNote = async (content: string) => {
    const { error } = await client.POST("/discussions/{discussionId}/notes", {
      headers: await accountMethods.authHeader(),
      params: { path: { discussionId: this.discussionId } },
      body: { content },
    });

    if (error) {
      console.error("Failed to create note:", error.message);
      return;
    }

    await this.fetchNotes();
  };

  private handleDeleteNote = async (noteId: string) => {
    const { error } = await client.DELETE(
      "/discussions/{discussionId}/notes/{noteId}",
      {
        headers: await accountMethods.authHeader(),
        params: {
          path: {
            discussionId: this.discussionId,
            noteId,
          },
        },
      }
    );

    if (error) {
      console.error("Failed to delete note:", error.message);
      return;
    }

    await this.fetchNotes();
  };

  private handleConvertNoteToComment = (note: Note) => {
    this.convertingNote = note;
    this.parentCommentIdForCreate = null;
    this.createCommentPopup.openWithContent(note.content);
  };

  static styles = [baseStyle];
}
