import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type {
  LearningDiscussionDeleteEvent,
  LearningDiscussionSelectEvent,
} from "../../event/discussion";
import "./discussion-list";
import type { LearningDiscussionList } from "./discussion-list";

const meta: Meta<LearningDiscussionList> = {
  title: "learning/ui/discussion-list",
  component: "learning-discussion-list",
};

export default meta;

type Story = StoryObj<LearningDiscussionList>;

export const Default: Story = {
  args: {
    summaries: [
      {
        id: "1",
        projectId: "p1",
        theme: "論理的な議論とは何か",
        status: "public",
        archivedAt: null,
        lastCommentedAt: "2023-01-01T00:00:00Z",
        proposedCommentsCount: 0,
        issuesCount: 0,
      },
      {
        id: "2",
        projectId: "p1",
        theme: "AIを活用した学習の効率化",
        status: "public",
        archivedAt: null,
        lastCommentedAt: "2023-01-02T00:00:00Z",
        proposedCommentsCount: 0,
        issuesCount: 0,
      },
      {
        id: "3",
        projectId: "p1",
        theme: "プログラミング教育の未来",
        status: "private",
        archivedAt: null,
        lastCommentedAt: "2023-01-03T00:00:00Z",
        proposedCommentsCount: 0,
        issuesCount: 0,
      },
    ],
  },
  render: (args) => html`
    <learning-discussion-list
      .summaries=${args.summaries}
      @learning-discussion-select=${(e: LearningDiscussionSelectEvent) =>
        console.log("selected", e.discussionId)}
      @learning-discussion-delete=${(e: LearningDiscussionDeleteEvent) =>
        console.log("deleted", e.discussionId)}
    ></learning-discussion-list>
  `,
};

export const Empty: Story = {
  args: {
    summaries: [],
  },
  render: (args) => html`
    <learning-discussion-list
      .summaries=${args.summaries}
    ></learning-discussion-list>
  `,
};
