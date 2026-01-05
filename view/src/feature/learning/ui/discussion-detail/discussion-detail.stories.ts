import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type {
  CancelEditDiscussionEvent,
  RequestEditDiscussionEvent,
  RequestUpdateDiscussionEvent,
} from "../../event/discussion";
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
      @request-edit-discussion=${(e: RequestEditDiscussionEvent) =>
        console.log("edit clicked")}
      @request-update-discussion=${(e: RequestUpdateDiscussionEvent) =>
        console.log("save clicked", e.theme)}
      @cancel-edit-discussion=${(e: CancelEditDiscussionEvent) =>
        console.log("cancel clicked")}
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
