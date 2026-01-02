import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-context";

const meta: Meta = {
  title: "learning/ui/comment-context",
  component: "learning-comment-context",
  render: (args) => html`
    <learning-comment-context
      .path=${args.path}
      .availableTypes=${args.availableTypes}
      .onCommentClick=${args.onCommentClick}
      .onCommentUpdate=${args.onCommentUpdate}
      .onCommentDelete=${args.onCommentDelete}
      .onCommentGenerate=${args.onCommentGenerate}
      .onCommentReply=${args.onCommentReply}
    ></learning-comment-context>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    availableTypes: ["idea", "question", "answer", "claim", "evidence"],
    path: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "論理的な議論を支援するためのプラットフォームについて",
        commentType: "idea",
        status: "active" as const,
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "具体的にどのような機能がありますか？",
        commentType: "question",
        status: "active" as const,
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "コメントフレームと木構造を用います。",
        commentType: "answer",
        status: "active" as const,
      },
    ],
  },
};
