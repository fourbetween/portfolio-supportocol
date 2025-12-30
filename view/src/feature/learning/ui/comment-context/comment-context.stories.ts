import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-context";

const meta: Meta = {
  title: "learning/ui/comment-context",
  component: "learning-comment-context",
  render: (args) => html`
    <learning-comment-context
      .ancestors=${args.ancestors}
    ></learning-comment-context>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    ancestors: [
      {
        id: "1",
        discussionId: "1",
        parentCommentId: null,
        content: "論理的な議論を支援するためのプラットフォームについて",
        commentType: "idea",
      },
      {
        id: "2",
        discussionId: "1",
        parentCommentId: "1",
        content: "具体的にどのような機能がありますか？",
        commentType: "question",
      },
      {
        id: "3",
        discussionId: "1",
        parentCommentId: "2",
        content: "コメントフレームと木構造を用います。",
        commentType: "answer",
      },
    ],
  },
};
