import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { MainHeaderPresenter } from "./main";

const meta = {
  title: "presenter/header/main",
  tags: ["autodocs"],
  render: () =>
    html`
      <main-header-presenter></main-header-presenter>
    `,
  argTypes: {},
} satisfies Meta<MainHeaderPresenter>;

export default meta;
type Story = StoryObj<MainHeaderPresenter>;

export const Default: Story = {
  args: {},
};
