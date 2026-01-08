import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-tree";
import type { LearningCommentTree } from "./comment-tree";

const meta: Meta<
  LearningCommentTree & {
    onSelectComment: (e: Event) => void;
    onCommentDeleted: (e: Event) => void;
    onCommentGenerate: (e: Event) => void;
    onCommentUpdate: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
  }
> = {
  title: "learning/ui/comment-tree",
  component: "learning-comment-tree",
  argTypes: {
    onSelectComment: { action: "comment-select" },
    onCommentDeleted: { action: "comment-deleted" },
    onCommentGenerate: { action: "comment-generate" },
    onCommentUpdate: { action: "comment-update" },
    onCommentCreate: { action: "comment-create" },
  },
  render: (args) => html`
    <learning-comment-tree
      .comments=${args.comments}
      @comment-select=${args.onSelectComment}
      @comment-deleted=${args.onCommentDeleted}
      @comment-generate=${args.onCommentGenerate}
      @comment-update=${args.onCommentUpdate}
      @comment-create=${args.onCommentCreate}
    ></learning-comment-tree>
  `,
};

export default meta;
type Story = StoryObj<
  LearningCommentTree & {
    onSelectComment: (e: Event) => void;
    onCommentDeleted: (e: Event) => void;
    onCommentGenerate: (e: Event) => void;
    onCommentUpdate: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
  }
>;

export const Default: Story = {
  args: {
    comments: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "論理的な議論を支援するためのプラットフォームについて",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "具体的にどのような機能がありますか？",
        commentType: "question",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "コメントフレームと木構造を用います。",
        commentType: "answer",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "3",
        content: "それは使いやすそうですね。",
        commentType: "agree",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "5",
        discussionId: "1",
        parentCommentId: "3",
        content: "モバイルでの表示はどうなりますか？",
        commentType: "question",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "6",
        discussionId: "1",
        parentCommentId: "1",
        content: "AIサポート機能も検討しています。",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
    ],
  },
};

export const DeepNesting: Story = {
  args: {
    comments: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "Level 0",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "Level 1",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "Level 2",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "3",
        content: "Level 3",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
    ],
  },
};

export const SameTypeChildren: Story = {
  args: {
    comments: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "Root",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 1",
        commentType: "question",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 2",
        commentType: "question",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 3",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
    ],
  },
};

export const SameTypeRoots: Story = {
  args: {
    comments: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "Root 1",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "Root 2",
        commentType: "idea",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: null,
        content: "Root 3",
        commentType: "question",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
    ],
  },
};
