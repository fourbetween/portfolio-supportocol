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
    onCommentGenerate: { action: "comment-generate" },
    onCommentUpdate: { action: "comment-update" },
    onCommentCreate: { action: "comment-create" },
    onProposedCommentAccept: { action: "proposed-comment-accept" },
    onProposedCommentReject: { action: "proposed-comment-reject" },
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

const mockProposedComment: Comment = {
  ...mockComment,
  status: "proposed" as const,
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
      @comment-generate=${args.onCommentGenerate}
      @comment-update=${args.onCommentUpdate}
      @comment-create=${args.onCommentCreate}
      @proposed-comment-accept=${args.onProposedCommentAccept}
      @proposed-comment-reject=${args.onProposedCommentReject}
    ></learning-comment-item>
  `,
  args: {
    activeChildrenCount: 3,
  },
};

export const Proposed: Story = {
  render: (args) => html`
    <learning-comment-item
      .comment=${mockProposedComment}
      .availableTypes=${availableTypes}
      @proposed-comment-accept=${args.onProposedCommentAccept}
      @proposed-comment-reject=${args.onProposedCommentReject}
    ></learning-comment-item>
  `,
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
