import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-context";
import type { LearningCommentContext } from "./comment-context";

type LearningCommentContextArgs = LearningCommentContext & {
  onSelectComment: (e: Event) => void;
  onCommentUpdated: (e: Event) => void;
  onCommentDeleted: (e: Event) => void;
  onCommentGenerate: (e: Event) => void;
  onCommentCreated: (e: Event) => void;
  onCommentUpdate: (e: Event) => void;
  onCommentCreate: (e: Event) => void;
};

const meta: Meta<LearningCommentContextArgs> = {
  title: "learning/ui/comment-context",
  component: "learning-comment-context",
  argTypes: {
    onSelectComment: { action: "learning-comment-select" },
    onCommentUpdated: { action: "learning-comment-updated" },
    onCommentDeleted: { action: "learning-comment-deleted" },
    onCommentGenerate: { action: "learning-comment-generate" },
    onCommentCreated: { action: "learning-comment-created" },
    onCommentUpdate: { action: "learning-comment-update" },
    onCommentCreate: { action: "learning-comment-create" },
  },
  render: (args) => html`
    <learning-comment-context
      .path=${args.path}
      .childCounts=${args.childCounts}
      .availableTypes=${args.availableTypes}
      @learning-comment-select=${args.onSelectComment}
      @learning-comment-updated=${args.onCommentUpdated}
      @learning-comment-deleted=${args.onCommentDeleted}
      @learning-comment-generate=${args.onCommentGenerate}
      @learning-comment-created=${args.onCommentCreated}
      @learning-comment-update=${args.onCommentUpdate}
      @learning-comment-create=${args.onCommentCreate}
      .readonly=${args.readonly}
    ></learning-comment-context>
  `,
};

export default meta;
type Story = StoryObj<LearningCommentContextArgs>;

const mockPath = [
  {
    id: "1",
    discussionId: "1",
    parentCommentId: null,
    content: "論理的な議論を支援するためのプラットフォームについて",
    type: "idea",
    status: "active" as const,
    issues: [],
    archivedAt: null,
    createdAt: "2026-01-04T00:00:00Z",
  },
  {
    id: "2",
    discussionId: "1",
    parentCommentId: "1",
    content: "具体的にどのような機能がありますか？",
    type: "question",
    status: "active" as const,
    issues: [],
    archivedAt: null,
    createdAt: "2026-01-04T00:00:00Z",
  },
  {
    id: "3",
    discussionId: "1",
    parentCommentId: "2",
    content: "コメントフレームと木構造を用います。",
    type: "answer",
    status: "active" as const,
    issues: [],
    archivedAt: null,
    createdAt: "2026-01-04T00:00:00Z",
  },
];

export const Default: Story = {
  args: {
    availableTypes: ["idea", "question", "answer", "claim", "evidence"],
    childCounts: new Map([
      ["1", 5],
      ["2", 3],
      ["3", 0],
    ]),
    path: mockPath,
  },
};

export const Readonly: Story = {
  args: {
    availableTypes: ["idea", "question", "answer", "claim", "evidence"],
    childCounts: new Map([
      ["1", 5],
      ["2", 3],
      ["3", 0],
    ]),
    path: mockPath,
    readonly: true,
  },
};

export const Archived: Story = {
  args: {
    availableTypes: ["idea", "question", "answer", "claim", "evidence"],
    childCounts: new Map([
      ["1", 5],
      ["2", 3],
      ["3", 0],
    ]),
    path: [
      {
        ...mockPath[0],
        issues: [],
        archivedAt: "2026-01-05T00:00:00Z",
      },
      ...mockPath.slice(1),
    ],
  },
};
