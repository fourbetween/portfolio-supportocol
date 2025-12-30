import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-detail";

const meta: Meta = {
  title: "learning/ui/discussion-detail",
  component: "learning-discussion-detail",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    discussion: {
      id: "1",
      theme: "論理的な議論とは何か",
    },
    isEditing: false,
  },
  render: (args) => html`
    <learning-discussion-detail
      .discussion=${args.discussion}
      .isEditing=${args.isEditing}
      .onEdit=${() => console.log("edit clicked")}
      .onSave=${(theme: string) => console.log("save clicked", theme)}
      .onCancel=${() => console.log("cancel clicked")}
    ></learning-discussion-detail>
  `,
};

export const Editing: Story = {
  args: {
    ...Default.args,
    isEditing: true,
  },
  render: Default.render,
};
