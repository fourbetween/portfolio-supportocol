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
        theme: "論理的な議論とは何か",
        status: "public",
        lastCommentedAt: "2023-01-01T00:00:00Z",
      },
      {
        id: "2",
        theme: "AIを活用した学習の効率化",
        status: "public",
        lastCommentedAt: "2023-01-02T00:00:00Z",
      },
      {
        id: "3",
        theme: "プログラミング教育の未来",
        status: "private",
        lastCommentedAt: "2023-01-03T00:00:00Z",
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
