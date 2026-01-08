import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-status-badge";
import type { LearningDiscussionStatusBadge } from "./discussion-status-badge";

const meta: Meta<LearningDiscussionStatusBadge> = {
  title: "learning/ui/discussion-status-badge",
  component: "learning-discussion-status-badge",
  render: (args) =>
    html`
      <learning-discussion-status-badge
        .status=${args.status}
      ></learning-discussion-status-badge>
    `,
};

export default meta;

type Story = StoryObj<LearningDiscussionStatusBadge>;

export const Public: Story = {
  args: {
    status: "public",
  },
};

export const Private: Story = {
  args: {
    status: "private",
  },
};
