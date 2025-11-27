import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { HomePagePresenter } from "./home";

const meta = {
  title: "presenter/page/home",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <home-page-presenter .onLogin=${args.onLogin}></home-page-presenter>
    `,
  argTypes: {
    onLogin: { action: "onLogin" },
  },
} satisfies Meta<HomePagePresenter>;

export default meta;
type Story = StoryObj<HomePagePresenter>;

export const Default: Story = {
  args: {},
};
