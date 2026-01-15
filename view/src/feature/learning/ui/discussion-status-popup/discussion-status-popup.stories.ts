import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-status-popup";

const meta: Meta = {
  title: "feature/learning/discussion-status-popup",
  component: "learning-discussion-status-popup",
};

export default meta;

export const Default: StoryObj = {
  render: (args) => html`
    <learning-discussion-status-popup
      .open=${args.open}
      @learning-discussion-update-status=${(e: any) =>
        console.log("update status", e.status)}
    ></learning-discussion-status-popup>
  `,
  args: {
    open: true,
  },
};
