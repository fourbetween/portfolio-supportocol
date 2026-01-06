import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { DiscussionSearchEvent } from "../../event/discussion";
import "./discussion-search-bar";

const meta: Meta = {
  title: "learning/ui/discussion-search-bar",
  component: "learning-discussion-search-bar",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    value: "",
  },
  render: (args) => html`
    <learning-discussion-search-bar
      .value=${args.value}
      @discussion-search=${(e: DiscussionSearchEvent) =>
        console.log("input", e.query)}
    ></learning-discussion-search-bar>
  `,
};
