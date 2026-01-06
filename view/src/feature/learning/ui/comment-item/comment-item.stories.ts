import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { Comment } from "../../model/comment";
import "./comment-item";

const meta: Meta = {
  title: "learning/ui/comment-item",
  component: "learning-comment-item",
  argTypes: {
    onSelectComment: { action: "comment-select" },
    onCommentDeleted: { action: "comment-deleted" },
    onCommentGenerated: { action: "comment-generated" },
    onCommentUpdate: { action: "comment-update" },
    onCommentCreate: { action: "comment-create" },
  },
};

export default meta;

type Story = StoryObj;

const mockComment: Comment = {
  id: "1",
  discussionId: "d1",
  parentCommentId: null,
  commentType: "idea",
  status: "active" as const,
  content: "This is a test comment",
  createdAt: "2026-01-04T00:00:00Z",
};

const availableTypes = ["idea", "question", "answer", "agreement"];

export const Default: Story = {
  render: (args) => html`
    <learning-comment-item
      .comment=${mockComment}
      .activeChildrenCount=${args.activeChildrenCount}
      .availableTypes=${availableTypes}
      @comment-select=${args.onSelectComment}
      @comment-deleted=${args.onCommentDeleted}
      @comment-generated=${args.onCommentGenerated}
      @comment-update=${args.onCommentUpdate}
      @comment-create=${args.onCommentCreate}
    ></learning-comment-item>
  `,
  args: {
    activeChildrenCount: 3,
  },
};

export const LongContent: Story = {
  render: () => html`
    <learning-comment-item
      .comment=${{
        ...mockComment,
        content:
          "This is a very long comment content to test how it looks when it wraps to multiple lines. ".repeat(
            5
          ),
      }}
      .availableTypes=${availableTypes}
    ></learning-comment-item>
  `,
};
