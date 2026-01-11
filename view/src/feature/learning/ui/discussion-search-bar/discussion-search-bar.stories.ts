import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { LearningDiscussionSearchEvent } from "../../event/discussion";
import "./discussion-search-bar";
import type { LearningDiscussionSearchBar } from "./discussion-search-bar";

const meta: Meta<LearningDiscussionSearchBar> = {
  title: "learning/ui/discussion-search-bar",
  component: "learning-discussion-search-bar",
};

export default meta;

type Story = StoryObj<LearningDiscussionSearchBar>;

export const Default: Story = {
  args: {
    value: "",
  },
  render: (args) => html`
    <learning-discussion-search-bar
      .value=${args.value}
      @learning-discussion-search=${(e: LearningDiscussionSearchEvent) =>
        console.log("input", e.query)}
    ></learning-discussion-search-bar>
  `,
};
