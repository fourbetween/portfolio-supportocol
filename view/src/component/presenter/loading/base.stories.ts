import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./base";

const meta: Meta = {
  title: "Presenter/Loading/Base",
  component: "base-loading-presenter",
  argTypes: {
    show: { control: "boolean" },
    progress: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj;

export const Spinner: Story = {
  args: {
    show: true,
    progress: undefined,
  },
  render: (args) => html`
    <base-loading-presenter
      .show=${args.show}
      .progress=${args.progress}
    ></base-loading-presenter>
  `,
};

export const ProgressBar: Story = {
  args: {
    show: true,
    progress: 50,
  },
  render: (args) => html`
    <base-loading-presenter
      .show=${args.show}
      .progress=${args.progress}
    ></base-loading-presenter>
  `,
};
