import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-item";

const meta: Meta = {
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
type Story = StoryObj;

export const Default: Story = {
  args: {
    discussion: {
      id: "1",
      theme: "Sample Discussion Theme",
      authorId: "user1",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z",
    },
  },
};
