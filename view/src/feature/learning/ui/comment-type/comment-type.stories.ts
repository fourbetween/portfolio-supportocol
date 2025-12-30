import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-type";

const meta: Meta = {
  title: "Feature/Learning/UI/CommentType",
  component: "learning-comment-type",
  render: (args) =>
    html`
      <learning-comment-type .type=${args.type}></learning-comment-type>
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
