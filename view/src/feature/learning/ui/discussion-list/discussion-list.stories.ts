import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type {
  DiscussionDeleteEvent,
  SelectDiscussionEvent,
} from "../../event/discussion";
import "./discussion-list";

const meta: Meta = {
  title: "learning/ui/discussion-list",
  component: "learning-discussion-list",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    discussions: [
      { id: "1", theme: "論理的な議論とは何か" },
      { id: "2", theme: "AIを活用した学習の効率化" },
      { id: "3", theme: "プログラミング教育の未来" },
    ],
  },
  render: (args) => html`
    <learning-discussion-list
      .discussions=${args.discussions}
      @discussion-select=${(e: SelectDiscussionEvent) =>
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
