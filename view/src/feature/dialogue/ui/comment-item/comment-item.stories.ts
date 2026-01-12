import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { Comment } from "../../model/comment";
import "./comment-item";
import type { DialogueCommentItem } from "./comment-item";

const meta: Meta<
  DialogueCommentItem & {
    onSelectComment: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
  }
> = {
  title: "dialogue/ui/comment-item",
  component: "dialogue-comment-item",
  argTypes: {
    onSelectComment: { action: "dialogue-comment-select" },
    onCommentCreate: { action: "dialogue-comment-create" },
  },
};

export default meta;

type Story = StoryObj<
  DialogueCommentItem & {
    onSelectComment: (e: Event) => void;
    onCommentCreate: (e: Event) => void;
  }
>;

const mockComment: Comment = {
  id: "1",
  discussionId: "d1",
  parentCommentId: null,
  commentType: "idea",
  status: "active" as const,
  content: "This is a test comment",
  createdAt: "2026-01-04T00:00:00Z",
};

const availableTypes = ["idea", "question", "answer", "agreement"];

export const Default: Story = {
  render: (args) => html`
    <dialogue-comment-item
      .comment=${mockComment}
      .activeChildrenCount=${args.activeChildrenCount}
      .availableTypes=${availableTypes}
      @dialogue-comment-select=${args.onSelectComment}
      @dialogue-comment-create=${args.onCommentCreate}
    ></dialogue-comment-item>
  `,
  args: {
    activeChildrenCount: 3,
  },
};

export const LongContent: Story = {
  render: (args) => html`
    <dialogue-comment-item
      .comment=${{
        ...mockComment,
        content:
          "This is a very long comment content to test how it looks when it wraps to multiple lines. ".repeat(
            5
          ),
      }}
      .availableTypes=${availableTypes}
      @dialogue-comment-select=${args.onSelectComment}
      @dialogue-comment-create=${args.onCommentCreate}
    ></dialogue-comment-item>
  `,
};

export const NoChildren: Story = {
  render: (args) => html`
    <dialogue-comment-item
      .comment=${mockComment}
      .activeChildrenCount=${0}
      .availableTypes=${availableTypes}
      @dialogue-comment-select=${args.onSelectComment}
      @dialogue-comment-create=${args.onCommentCreate}
    ></dialogue-comment-item>
  `,
};
