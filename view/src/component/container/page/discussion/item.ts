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
  Issue,
  Note,
} from "../../../../model/discussion";
import type { ChangeStatusPopupPresenter } from "../../../presenter/popup/comment/change_status";
import type { CreateCommentPopupPresenter } from "../../../presenter/popup/comment/create";
import type { CreateIssuePopupPresenter } from "../../../presenter/popup/issue/create";
import type { ListIssuePopupPresenter } from "../../../presenter/popup/issue/list";

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

  @state()
  private selectedCommentIdForIssue: string | null = null;

  @state()
  private issues: Issue[] = [];

  @state()
  private selectedCommentIdForShowIssues: string | null = null;

  @query("create-comment-popup-presenter")
  private createCommentPopup!: CreateCommentPopupPresenter;

  @query("change-status-popup-presenter")
  private changeStatusPopup!: ChangeStatusPopupPresenter;

  @query("create-issue-popup-presenter")
  private createIssuePopup!: CreateIssuePopupPresenter;

  @query("list-issue-popup-presenter")
  private listIssuePopup!: ListIssuePopupPresenter;

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
          this.fetchIssues();
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

  private async fetchIssues() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/issues",
      {
        headers: await accountMethods.authHeader(),
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      console.error("Failed to fetch issues:", error.message);
      return;
    }
    this.issues = data;
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
        .issues=${this.issues}
        .onAddComment=${this.handleAddComment}
        .onFocusComment=${this.handleFocusComment}
        .onClearFocus=${this.handleClearFocus}
        .onChangeStatus=${this.handleChangeStatusClick}
        .onAddIssue=${this.handleAddIssueClick}
        .onShowIssues=${this.handleShowIssuesClick}
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

      <create-issue-popup-presenter
        .onCreate=${this.handleCreateIssue}
      ></create-issue-popup-presenter>

      <list-issue-popup-presenter
        .issues=${this.getIssuesForSelectedComment()}
      ></list-issue-popup-presenter>
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
    const { data: newComment, error } = await client.POST(
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
    this.comments = [...this.comments, newComment];
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

    const { data: updatedComment, error } = await client.PUT(
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
    this.comments = this.comments.map((c) =>
      c.id === updatedComment.id ? updatedComment : c
    );
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

  private handleShowIssuesClick = (commentId: string) => {
    this.selectedCommentIdForShowIssues = commentId;
    this.listIssuePopup.open();
  };

  private getIssuesForSelectedComment(): Issue[] {
    if (!this.selectedCommentIdForShowIssues) return [];
    return this.issues.filter(
      (issue) => issue.commentId === this.selectedCommentIdForShowIssues
    );
  }

  private handleAddIssueClick = (commentId: string) => {
    this.selectedCommentIdForIssue = commentId;
    this.createIssuePopup.open();
  };

  private handleCreateIssue = async (data: {
    issueType: "contradiction" | "circular_logic";
    description: string;
  }) => {
    if (!this.selectedCommentIdForIssue) return;

    const { error } = await client.POST("/discussions/{discussionId}/issues", {
      headers: await accountMethods.authHeader(),
      params: { path: { discussionId: this.discussionId } },
      body: {
        commentId: this.selectedCommentIdForIssue,
        issueType: data.issueType,
        description: data.description,
      },
    });

    if (error) {
      console.error("Failed to create issue:", error.message);
      return;
    }

    this.createIssuePopup.close();
    this.selectedCommentIdForIssue = null;
  };
}
