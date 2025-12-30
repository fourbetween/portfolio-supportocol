import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./discussion-add-form";

const meta: Meta = {
  title: "learning/ui/discussion-add-form",
  component: "learning-discussion-add-form",
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <learning-discussion-add-form
      .onSubmit=${(t: string) => console.log("submit", t)}
    ></learning-discussion-add-form>
  `,
};
