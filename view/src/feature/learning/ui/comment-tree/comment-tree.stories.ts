import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-tree";

const meta: Meta = {
  title: "learning/ui/comment-tree",
  component: "learning-comment-tree",
  argTypes: {
    onCommentClick: { action: "onCommentClick" },
  },
  render: (args) => html`
    <learning-comment-tree
      .comments=${args.comments}
      .onCommentClick=${args.onCommentClick}
    ></learning-comment-tree>
  `,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    comments: [
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
        parentCommentId: "1",
        content: "コメントフレームと木構造を用います。",
        commentType: "answer",
      },
      {
        id: "4",
        discussionId: "1",
        parentCommentId: "3",
        content: "それは使いやすそうですね。",
        commentType: "agree",
      },
      {
        id: "5",
        discussionId: "1",
        parentCommentId: "3",
        content: "モバイルでの表示はどうなりますか？",
        commentType: "question",
      },
      {
        id: "6",
        discussionId: "1",
        parentCommentId: "1",
        content: "AIサポート機能も検討しています。",
        commentType: "idea",
      },
    ],
  },
};
