import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { LearningDiscussionUpdateEvent } from "../../event/discussion";
import "./discussion-detail";
import type { LearningDiscussionDetail } from "./discussion-detail";

const meta: Meta<LearningDiscussionDetail> = {
  title: "learning/ui/discussion-detail",
  component: "learning-discussion-detail",
};

export default meta;

type Story = StoryObj<LearningDiscussionDetail>;

export const Default: Story = {
  args: {
    discussion: {
      id: "1",
      projectId: "p1",
      theme: "論理的な議論とは何か",
      conclusion: "前提を共有し、推論を積み重ねること。",
      status: "public",
      archivedAt: null,
      dialogueSettings: null,
    },
    isEditing: false,
  },
  render: (args) => html`
    <learning-discussion-detail
      .discussion=${args.discussion}
      .isEditing=${args.isEditing}
      @learning-discussion-form-open=${() => console.log("edit clicked")}
      @learning-discussion-update=${(e: LearningDiscussionUpdateEvent) =>
        console.log("save clicked", e.theme, e.conclusion)}
      @learning-discussion-form-close=${() => console.log("cancel clicked")}
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
