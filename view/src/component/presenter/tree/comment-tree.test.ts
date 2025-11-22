import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Comment, CommentType } from "../../../model/discussion";
import "./comment-tree";
import type { CommentTreePresenter } from "./comment-tree";

describe("CommentTreePresenter", () => {
  let elem: CommentTreePresenter;
  const comments: Comment[] = [
    {
      id: "1",
      discussionId: "d1",
      parentCommentId: null,
      commentTypeId: "t1",
      content: "Root",
      postedBy: "user1",
      postedAt: "2023-01-01T00:00:00Z",
      status: "assigned",
    },
    {
      id: "2",
      discussionId: "d1",
      parentCommentId: "1",
      commentTypeId: "t2",
      content: "Child",
      postedBy: "user2",
      postedAt: "2023-01-01T00:00:00Z",
      status: "assigned",
    },
  ];
  const commentTypes: CommentType[] = [
    {
      id: "t1",
      ruleId: "r1",
      name: "Type1",
      description: "Desc1",
      color: "#000000",
    },
    {
      id: "t2",
      ruleId: "r1",
      name: "Type2",
      description: "Desc2",
      color: "#ffffff",
    },
  ];

  beforeEach(() => {
    elem = document.createElement(
      "comment-tree-presenter"
    ) as CommentTreePresenter;
    elem.comments = comments;
    elem.commentTypes = commentTypes;
    document.body.appendChild(elem);
  });

  afterEach(() => {
    elem.remove();
  });

  it("コメントツリーが表示されること", async () => {
    await elem.updateComplete;
    const tree = elem.shadowRoot?.querySelector(".comment-tree");
    expect(tree).toBeTruthy();

    const presenters = elem.shadowRoot?.querySelectorAll("comment-presenter");
    expect(presenters?.length).toBe(2);
  });
});
