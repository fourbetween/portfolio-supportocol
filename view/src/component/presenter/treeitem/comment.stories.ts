import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Comment, CommentType } from "../../../model/discussion";
import type { CommentTreeitemPresenter } from "./comment";

const comment: Comment = {
  id: "01J8Y000000000000000000001",
  discussionId: "01J8Y000000000000000000000",
  parentCommentId: null,
  commentTypeId: "01J8Y000000000000000000001",
  content:
    "リスクベースアプローチを採用し、AIシステムをリスクレベル（許容できないリスク、高リスク、限定的リスク、最小リスク）に分類して規制すべきです。",
  postedBy: "user123",
  postedAt: "2023-10-25T10:00:00Z",
  status: "assigned",
};

const commentType: CommentType = {
  id: "01J8Y000000000000000000001",
  name: "提案",
  description: "",
  color: "#0969da",
};

const meta = {
  title: "presenter/treeitem/comment",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <comment-treeitem-presenter
        .comment=${args.comment}
        .commentType=${args.commentType}
      ></comment-treeitem-presenter>
    `,
  argTypes: {
    comment: { control: "object" },
    commentType: { control: "object" },
  },
} satisfies Meta<CommentTreeitemPresenter>;

export default meta;
type Story = StoryObj<CommentTreeitemPresenter>;

export const Default: Story = {
  args: {
    comment: comment,
    commentType: commentType,
  },
};

export const NoType: Story = {
  args: {
    comment: comment,
    commentType: undefined,
  },
};
