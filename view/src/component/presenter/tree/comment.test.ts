import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Comment } from "../../../model/discussion";
import "./comment";
import type { CommentPresenter } from "./comment";

describe("CommentPresenter", () => {
  let elem: CommentPresenter;
  const comment: Comment = {
    id: "01J8Y000000000000000000001",
    discussionId: "01J8Y000000000000000000000",
    parentCommentId: null,
    commentTypeId: "01J8Y000000000000000000001",
    content: "Test content",
    postedBy: "user1",
    postedAt: "2023-01-01T00:00:00Z",
    status: "assigned",
  };

  beforeEach(() => {
    elem = document.createElement("comment-presenter") as CommentPresenter;
    elem.comment = comment;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("コメントの内容が表示されること", async () => {
    // Wait for update
    await elem.updateComplete;
    const content = elem.shadowRoot?.querySelector(".comment-body");
    expect(content).toBeTruthy();
    expect(content?.textContent).toContain("Test content");
  });
});
