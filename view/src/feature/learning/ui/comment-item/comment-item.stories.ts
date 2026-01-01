import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { Comment } from "../../model/comment";
import "./comment-item";

const meta: Meta = {
  title: "learning/ui/comment-item",
  component: "learning-comment-item",
};

export default meta;

type Story = StoryObj;

const mockComment: Comment = {
  id: "1",
  discussionId: "d1",
  parentCommentId: null,
  commentType: "idea",
  content: "This is a test comment",
};

const availableTypes = ["idea", "question", "answer", "agreement"];

export const Default: Story = {
  render: () => html`
    <learning-comment-item
      .comment=${mockComment}
      .availableTypes=${availableTypes}
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
            5
          ),
      }}
      .availableTypes=${availableTypes}
    ></learning-comment-item>
  `,
};
