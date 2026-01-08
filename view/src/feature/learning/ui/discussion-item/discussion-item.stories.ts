import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-item";
import type { LearningDiscussionItem } from "./discussion-item";

const meta: Meta<LearningDiscussionItem> = {
  title: "learning/ui/discussion-item",
  component: "learning-discussion-item",
  render: (args) =>
    html`
      <learning-discussion-item
        .discussion=${args.discussion}
      ></learning-discussion-item>
    `,
};

export default meta;
type Story = StoryObj<LearningDiscussionItem>;

export const Default: Story = {
  args: {
    discussion: {
      id: "1",
      theme: "Sample Discussion Theme",
      status: "public",
    },
  },
};
