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
    onSelectComment: { action: "comment-select" },
    onCommentUpdated: { action: "comment-updated" },
    onCommentDeleted: { action: "comment-deleted" },
    onCommentGenerate: { action: "comment-generate" },
    onCommentCreated: { action: "comment-created" },
    onCommentUpdate: { action: "comment-update" },
    onCommentCreate: { action: "comment-create" },
  },
  render: (args) => html`
    <learning-comment-context
      .path=${args.path}
      .childCounts=${args.childCounts}
      .availableTypes=${args.availableTypes}
      @comment-select=${args.onSelectComment}
      @comment-updated=${args.onCommentUpdated}
      @comment-deleted=${args.onCommentDeleted}
      @comment-generate=${args.onCommentGenerate}
      @comment-created=${args.onCommentCreated}
      @comment-update=${args.onCommentUpdate}
      @comment-create=${args.onCommentCreate}
    ></learning-comment-context>
  `,
};

export default meta;
type Story = StoryObj<LearningCommentContextArgs>;

export const Default: Story = {
  args: {
    availableTypes: ["idea", "question", "answer", "claim", "evidence"],
    childCounts: new Map([
      ["1", 5],
      ["2", 3],
      ["3", 0],
    ]),
    path: [
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
        parentCommentId: "2",
        content: "コメントフレームと木構造を用います。",
        commentType: "answer",
        status: "active" as const,
        createdAt: "2026-01-04T00:00:00Z",
      },
    ],
  },
};
