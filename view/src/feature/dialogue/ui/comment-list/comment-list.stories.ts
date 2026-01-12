import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-list";
import type { DialogueCommentList } from "./comment-list";

const meta: Meta<DialogueCommentList> = {
  title: "dialogue/ui/comment-list",
  component: "dialogue-comment-list",
};

export default meta;

type Story = StoryObj<DialogueCommentList>;

export const Default: Story = {
  args: {
    comments: [
      {
        id: "1",
        content: "Oldest comment",
        createdAt: "2023-01-01T12:00:00Z",
        status: "active",
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
      {
        id: "2",
        content: "Newest comment",
        createdAt: "2023-01-03T12:00:00Z",
        status: "active",
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
      {
        id: "3",
        content: "Middle comment",
        createdAt: "2023-01-02T12:00:00Z",
        status: "active",
        commentType: "opinion",
        discussionId: "d1",
        parentCommentId: null,
      },
    ],
  },
  render: (args) => html`
    <dialogue-comment-list .comments=${args.comments}></dialogue-comment-list>
  `,
};

export const Empty: Story = {
  args: {
    comments: [],
  },
  render: (args) => html`
    <dialogue-comment-list .comments=${args.comments}></dialogue-comment-list>
  `,
};
