import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { Comment } from "../../model/comment";
import "./comment-item";
import type { LearningCommentItem } from "./comment-item";

const meta: Meta<
  LearningCommentItem & {
    onSelectComment: (e: Event) => void;
    onCommentDeleted: (e: Event) => void;
    onCommentGenerate: (e: Event) => void;
    onCommentUpdate: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
    onProposedCommentAccept: (e: Event) => void;
    onProposedCommentReject: (e: Event) => void;
  }
> = {
  title: "learning/ui/comment-item",
  component: "learning-comment-item",
  argTypes: {
    onSelectComment: { action: "learning-comment-select" },
    onCommentDeleted: { action: "learning-comment-deleted" },
    onCommentGenerate: { action: "learning-comment-generate" },
    onCommentUpdate: { action: "learning-comment-update" },
    onCommentCreate: { action: "learning-comment-create" },
    onProposedCommentAccept: { action: "learning-proposed-comment-accept" },
    onProposedCommentReject: { action: "learning-proposed-comment-reject" },
  },
};

export default meta;

type Story = StoryObj<
  LearningCommentItem & {
    onSelectComment: (e: Event) => void;
    onCommentDeleted: (e: Event) => void;
    onCommentGenerate: (e: Event) => void;
    onCommentUpdate: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
    onProposedCommentAccept: (e: Event) => void;
    onProposedCommentReject: (e: Event) => void;
  }
>;

const mockComment: Comment = {
  id: "1",
  discussionId: "d1",
  parentCommentId: null,
  commentType: "idea",
  status: "active" as const,
  content: "This is a test comment",
  issues: [],
  createdAt: "2026-01-04T00:00:00Z",
  archivedAt: null,
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
      @learning-comment-select=${args.onSelectComment}
      @learning-comment-deleted=${args.onCommentDeleted}
      @learning-comment-generate=${args.onCommentGenerate}
      @learning-comment-update=${args.onCommentUpdate}
      @learning-comment-create=${args.onCommentCreate}
      @learning-proposed-comment-accept=${args.onProposedCommentAccept}
      @learning-proposed-comment-reject=${args.onProposedCommentReject}
    ></learning-comment-item>
  `,
  args: {
    activeChildrenCount: 3,
  },
};

export const Readonly: Story = {
  render: (args) => html`
    <learning-comment-item
      .comment=${mockComment}
      .activeChildrenCount=${args.activeChildrenCount}
      .availableTypes=${availableTypes}
      .readonly=${true}
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
      @learning-proposed-comment-accept=${args.onProposedCommentAccept}
      @learning-proposed-comment-reject=${args.onProposedCommentReject}
    ></learning-comment-item>
  `,
};

export const Archived: Story = {
  render: (args) => html`
    <learning-comment-item
      .comment=${{
        ...mockComment,
        issues: [],
        archivedAt: "2026-01-05T00:00:00Z",
      }}
      .availableTypes=${availableTypes}
      @learning-comment-select=${args.onSelectComment}
      @learning-comment-deleted=${args.onCommentDeleted}
      @learning-comment-generate=${args.onCommentGenerate}
      @learning-comment-update=${args.onCommentUpdate}
      @learning-comment-create=${args.onCommentCreate}
    ></learning-comment-item>
  `,
};

export const InheritedArchived: Story = {
  render: () => html`
    <learning-comment-item
      .comment=${mockComment}
      .availableTypes=${availableTypes}
      .archived=${true}
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
            5,
          ),
      }}
      .availableTypes=${availableTypes}
    ></learning-comment-item>
  `,
};
