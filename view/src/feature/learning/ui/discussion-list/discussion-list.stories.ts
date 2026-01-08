import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type {
  DiscussionDeleteEvent,
  DiscussionSelectEvent,
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
    discussions: [
      { id: "1", theme: "論理的な議論とは何か", status: "public" },
      { id: "2", theme: "AIを活用した学習の効率化", status: "public" },
      { id: "3", theme: "プログラミング教育の未来", status: "private" },
    ],
  },
  render: (args) => html`
    <learning-discussion-list
      .discussions=${args.discussions}
      @discussion-select=${(e: DiscussionSelectEvent) =>
        console.log("selected", e.discussion)}
      @discussion-delete=${(e: DiscussionDeleteEvent) =>
        console.log("deleted", e.discussion)}
    ></learning-discussion-list>
  `,
};

export const Empty: Story = {
  args: {
    discussions: [],
  },
  render: (args) => html`
    <learning-discussion-list
      .discussions=${args.discussions}
    ></learning-discussion-list>
  `,
};
