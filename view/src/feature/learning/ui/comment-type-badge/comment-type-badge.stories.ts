import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-type-badge";

const meta: Meta = {
  title: "learning/ui/comment-type-badge",
  component: "learning-comment-type-badge",
  render: (args) =>
    html`
      <learning-comment-type-badge
        .type=${args.type}
      ></learning-comment-type-badge>
    `,
};

export default meta;

type Story = StoryObj;

export const Idea: Story = {
  args: {
    type: "idea",
  },
};

export const Question: Story = {
  args: {
    type: "question",
  },
};
