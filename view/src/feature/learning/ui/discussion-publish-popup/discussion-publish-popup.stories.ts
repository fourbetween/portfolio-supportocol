import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-publish-popup";

const meta: Meta = {
  title: "feature/learning/discussion-publish-popup",
  component: "learning-discussion-publish-popup",
};

export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <learning-discussion-publish-popup
      .open=${args.open}
      @learning-discussion-publish=${() => console.log("publish")}
    ></learning-discussion-publish-popup>
  `,
  args: {
    open: true,
  },
};
