import type { Router } from "@lit-labs/router";
import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { LitElement, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { client } from "../../../../api/identity/client";
import { routerContext } from "../../../../context/router";
import { showToast } from "../../../../event/toast";
import type {
  Comment,
  CommentStatus,
  CommentType,
  Discussion,
  Issue,
  Note,
} from "../../../../model/discussion";
import type { Rule } from "../../../../model/rule";
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
  private rule?: Rule;

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
            params: { path: { discussionId } },
          }
        );
        if (error) {
          showToast(
            this,
            `議論の取得に失敗しました: ${error.message}`,
            "error"
          );
          return undefined;
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
      params: { path: { ruleId } },
    });
    if (error) {
      showToast(this, `ルールの取得に失敗しました: ${error.message}`, "error");
      return;
    }
    this.rule = data;
    this.commentTypes = data.commentTypes;
  }

  private async fetchComments() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/comments",
      {
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      showToast(
        this,
        `コメントの取得に失敗しました: ${error.message}`,
        "error"
      );
      return;
    }
    this.comments = data;
  }

  private async fetchNotes() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/notes",
      {
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      showToast(this, `ノートの取得に失敗しました: ${error.message}`, "error");
      return;
    }
    this.notes = data;
  }

  private async fetchIssues() {
    const { data, error } = await client.GET(
      "/discussions/{discussionId}/issues",
      {
        params: { path: { discussionId: this.discussionId } },
      }
    );
    if (error) {
      showToast(this, `指摘の取得に失敗しました: ${error.message}`, "error");
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
        .rule=${this.rule}
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
        .rule=${this.rule}
        .fromCommentTypeId=${this.getFromCommentTypeId()}
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

  private getFromCommentTypeId(): string {
    if (!this.parentCommentIdForCreate) {
      return "";
    }
    const parentComment = this.comments.find(
      (c) => c.id === this.parentCommentIdForCreate
    );
    return parentComment?.commentTypeId ?? "";
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
        params: { path: { discussionId: this.discussionId } },
        body: {
          parentCommentId: this.parentCommentIdForCreate ?? "",
          commentTypeId: data.commentTypeId,
          content: data.content,
        },
      }
    );

    if (error) {
      showToast(
        this,
        `コメントの作成に失敗しました: ${error.message}`,
        "error"
      );
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
      showToast(
        this,
        `コメントの更新に失敗しました: ${error.message}`,
        "error"
      );
      return;
    }

    this.changeStatusPopup.close();
    this.comments = this.comments.map((c) =>
      c.id === updatedComment.id ? updatedComment : c
    );
  };

  private handleCreateNote = async (content: string) => {
    const { error } = await client.POST("/discussions/{discussionId}/notes", {
      params: { path: { discussionId: this.discussionId } },
      body: { content },
    });

    if (error) {
      showToast(this, `ノートの作成に失敗しました: ${error.message}`, "error");
      return;
    }

    await this.fetchNotes();
  };

  private handleDeleteNote = async (noteId: string) => {
    const { error } = await client.DELETE(
      "/discussions/{discussionId}/notes/{noteId}",
      {
        params: {
          path: {
            discussionId: this.discussionId,
            noteId,
          },
        },
      }
    );

    if (error) {
      showToast(this, `ノートの削除に失敗しました: ${error.message}`, "error");
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

    const { data: createdIssue, error } = await client.POST(
      "/discussions/{discussionId}/issues",
      {
        params: { path: { discussionId: this.discussionId } },
        body: {
          commentId: this.selectedCommentIdForIssue,
          issueType: data.issueType,
          description: data.description,
        },
      }
    );

    if (error) {
      showToast(this, `指摘の作成に失敗しました: ${error.message}`, "error");
      return;
    }

    this.createIssuePopup.close();
    this.selectedCommentIdForIssue = null;
    this.issues = [...this.issues, createdIssue];
  };
}
