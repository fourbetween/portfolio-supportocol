import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { RequestUpdateDiscussionEvent } from "../../event/discussion";
import "./discussion-edit-form";

const meta: Meta = {
  title: "learning/ui/discussion-edit-form",
  component: "learning-discussion-edit-form",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    theme: "論理的な議論とは何か",
  },
  render: (args) => html`
    <learning-discussion-edit-form
      .theme=${args.theme}
      @discussion-update=${(e: RequestUpdateDiscussionEvent) =>
        console.log("save clicked", e.theme)}
      @cancel-edit-discussion=${() => console.log("cancel clicked")}
    ></learning-discussion-edit-form>
  `,
};
