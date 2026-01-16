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
        .summary=${args.summary}
      ></learning-discussion-item>
    `,
};

export default meta;
type Story = StoryObj<LearningDiscussionItem>;

export const Default: Story = {
  args: {
    summary: {
      id: "1",
      theme: "Sample Discussion Theme",
      status: "public",
      lastCommentedAt: "2023-01-01T00:00:00Z",
    },
  },
};
