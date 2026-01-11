import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { LearningDiscussionCreateEvent } from "../../event/discussion";
import "./discussion-add-form";
import type { LearningDiscussionAddForm } from "./discussion-add-form";

const meta: Meta<LearningDiscussionAddForm> = {
  title: "learning/ui/discussion-add-form",
  component: "learning-discussion-add-form",
};

export default meta;

type Story = StoryObj<LearningDiscussionAddForm>;

export const Default: Story = {
  render: () => html`
    <learning-discussion-add-form
      @learning-discussion-create=${(e: LearningDiscussionCreateEvent) =>
        console.log("submit", e.theme)}
    ></learning-discussion-add-form>
  `,
};
