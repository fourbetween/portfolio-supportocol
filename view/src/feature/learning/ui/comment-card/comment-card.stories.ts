import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-card";

const meta: Meta = {
  title: "learning/ui/comment-card",
  component: "learning-comment-card",
  render: (args) => html`
    <learning-comment-card
      .comment=${args.comment}
      .activeChildrenCount=${args.activeChildrenCount}
    ></learning-comment-card>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    comment: {
      id: "1",
      discussionId: "1",
      parentCommentId: "0",
      content:
        "これはテストコメントです。論理的な議論を支援するためのコメントフレームと木構造を用います。",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    },
    activeChildrenCount: 0,
  },
};

export const WithChildren: Story = {
  args: {
    comment: {
      id: "3",
      discussionId: "1",
      parentCommentId: "0",
      content: "子コメントを持つコメントの表示テストです。",
      commentType: "idea",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    },
    activeChildrenCount: 5,
  },
};

export const Question: Story = {
  args: {
    comment: {
      id: "2",
      discussionId: "1",
      parentCommentId: "1",
      content: "この前提条件についてはどうお考えですか？",
      commentType: "question",
      status: "active" as const,
      createdAt: "2026-01-04T00:00:00Z",
    },
  },
};

export const Proposed: Story = {
  args: {
    comment: {
      id: "4",
      discussionId: "1",
      parentCommentId: "0",
      content: "これは提案中のコメントです。背景色が少し暗くなります。",
      commentType: "idea",
      status: "proposed" as const,
      createdAt: "2026-01-04T00:00:00Z",
    },
  },
};
