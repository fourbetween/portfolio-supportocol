import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { LearningDiscussionUpdateEvent } from "../../event/discussion";
import "./discussion-edit-form";
import type { LearningDiscussionEditForm } from "./discussion-edit-form";

const meta: Meta<LearningDiscussionEditForm> = {
  title: "learning/ui/discussion-edit-form",
  component: "learning-discussion-edit-form",
};

export default meta;

type Story = StoryObj<LearningDiscussionEditForm>;

export const Default: Story = {
  args: {
    theme: "論理的な議論とは何か",
    conclusion: "前提を共有し、推論を積み重ねること。",
  },
  render: (args) => html`
    <learning-discussion-edit-form
      .theme=${args.theme}
      .conclusion=${args.conclusion}
      @learning-discussion-update=${(e: LearningDiscussionUpdateEvent) =>
        console.log("save clicked", e.theme, e.conclusion)}
      @learning-discussion-form-close=${() => console.log("cancel clicked")}
    ></learning-discussion-edit-form>
  `,
};
