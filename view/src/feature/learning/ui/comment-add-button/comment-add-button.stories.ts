import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-add-button";
import type { LearningCommentAddButton } from "./comment-add-button";

const meta: Meta<LearningCommentAddButton> = {
  title: "learning/ui/comment-add-button",
  component: "learning-comment-add-button",
  render: (args) => html`
    <learning-comment-add-button
      .isReply=${args.isReply}
    ></learning-comment-add-button>
  `,
};

export default meta;
type Story = StoryObj<LearningCommentAddButton>;

export const NewComment: Story = {
  args: {
    isReply: false,
  },
};

export const Reply: Story = {
  args: {
    isReply: true,
  },
};
