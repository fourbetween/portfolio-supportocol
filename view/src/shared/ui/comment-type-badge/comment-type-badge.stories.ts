import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-type-badge";
import type { CommentTypeBadge } from "./comment-type-badge";

const meta: Meta<CommentTypeBadge> = {
  title: "shared/ui/comment-type-badge",
  component: "ui-comment-type-badge",
  render: (args) =>
    html`
      <ui-comment-type-badge
        .type=${args.type}
        .active=${args.active}
        .clickable=${args.clickable}
      ></ui-comment-type-badge>
    `,
};

export default meta;

type Story = StoryObj<CommentTypeBadge>;

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

export const Active: Story = {
  args: {
    type: "idea",
    active: true,
  },
};

export const Clickable: Story = {
  args: {
    type: "idea",
    clickable: true,
  },
};
