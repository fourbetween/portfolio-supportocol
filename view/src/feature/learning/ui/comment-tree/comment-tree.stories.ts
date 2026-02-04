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
    onSelectComment: { action: "learning-comment-select" },
    onCommentDeleted: { action: "learning-comment-deleted" },
    onCommentGenerate: { action: "learning-comment-generate" },
    onCommentUpdate: { action: "learning-comment-update" },
    onCommentCreate: { action: "learning-comment-create" },
  },
  render: (args) => html`
    <learning-comment-tree
      .comments=${args.comments}
      @learning-comment-select=${args.onSelectComment}
      @learning-comment-deleted=${args.onCommentDeleted}
      @learning-comment-generate=${args.onCommentGenerate}
      @learning-comment-update=${args.onCommentUpdate}
      @learning-comment-create=${args.onCommentCreate}
      .readonly=${args.readonly}
      .showArchived=${args.showArchived}
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

const mockComments = [
  {
    id: "1",
    discussionId: "1",
    parentCommentId: null,
    content: "論理的な議論を支援するためのプラットフォームについて",
    type: "idea",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
  {
    id: "2",
    discussionId: "1",
    parentCommentId: "1",
    content: "具体的にどのような機能がありますか？",
    type: "question",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
  {
    id: "3",
    discussionId: "1",
    parentCommentId: "1",
    content: "コメントフレームと木構造を用います。",
    type: "answer",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
  {
    id: "4",
    discussionId: "1",
    parentCommentId: "3",
    content: "それは使いやすそうですね。",
    type: "agree",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
  {
    id: "5",
    discussionId: "1",
    parentCommentId: "3",
    content: "モバイルでの表示はどうなりますか？",
    type: "question",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
  {
    id: "6",
    discussionId: "1",
    parentCommentId: "1",
    content: "AIサポート機能も検討しています。",
    type: "idea",
    status: "active" as const,
    issues: [],
    createdAt: "2026-01-04T00:00:00Z",
    archivedAt: null,
  },
];

export const Default: Story = {
  args: {
    comments: mockComments,
  },
};

export const Readonly: Story = {
  args: {
    comments: mockComments,
    readonly: true,
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
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "Level 1",
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "Level 2",
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "3",
        content: "Level 3",
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
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
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 1",
        type: "question",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 2",
        type: "question",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "1",
        content: "Child 3",
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
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
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: null,
        content: "Root 2",
        type: "idea",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: null,
        content: "Root 3",
        type: "question",
        status: "active" as const,
        issues: [],
        createdAt: "2026-01-04T00:00:00Z",
        archivedAt: null,
      },
    ],
  },
};

export const Archived: Story = {
  args: {
    comments: [
      {
        ...mockComments[0],
        issues: [],
        archivedAt: "2026-01-05T00:00:00Z",
      },
      ...mockComments.slice(1),
    ],
  },
};
