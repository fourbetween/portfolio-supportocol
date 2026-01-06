import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type {
  ProposedCommentAcceptEvent,
  RejectProposedCommentEvent,
  SelectProposedCommentEvent,
} from "../../event/comment";
import type { Comment } from "../../model/comment";
import "./proposed-comment-list";

const meta: Meta = {
  title: "learning/ui/proposed-comment-list",
  component: "learning-proposed-comment-list",
};

export default meta;

type Story = StoryObj;

const comments: Comment[] = [
  {
    id: "1",
    discussionId: "d1",
    parentCommentId: null,
    content:
      "これは提案されたコメントの例です。AIによって生成された可能性があります。",
    commentType: "idea",
    status: "proposed",
    createdAt: "2026-01-04T00:00:00Z",
  },
  {
    id: "2",
    discussionId: "d1",
    parentCommentId: null,
    content: "別の視点からの提案です。議論を深めるための質問が含まれています。",
    commentType: "question",
    status: "proposed",
    createdAt: "2026-01-04T00:00:00Z",
  },
];

export const Default: Story = {
  args: {
    comments: comments,
  },
  render: (args) => html`
    <learning-proposed-comment-list
      .comments=${args.comments}
      @proposed-comment-accept=${(e: ProposedCommentAcceptEvent) =>
        console.log("Accepted", e.comment)}
      @reject-proposed-comment=${(e: RejectProposedCommentEvent) =>
        console.log("Rejected", e.comment)}
      @select-proposed-comment=${(e: SelectProposedCommentEvent) =>
        console.log("Clicked", e.comment)}
    ></learning-proposed-comment-list>
  `,
};

export const Empty: Story = {
  args: {
    comments: [],
  },
};
