import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { MainHeaderPresenter } from "./main";

const meta = {
  title: "presenter/header/main",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <main-header-presenter
        .getDashboardLink=${args.getDashboardLink}
        .getDiscussionsLink=${args.getDiscussionsLink}
        .getRulesLink=${args.getRulesLink}
      ></main-header-presenter>
    `,
  argTypes: {
    getDashboardLink: { control: false },
    getDiscussionsLink: { control: false },
    getRulesLink: { control: false },
  },
} satisfies Meta<MainHeaderPresenter>;

export default meta;
type Story = StoryObj<MainHeaderPresenter>;

export const Default: Story = {
  args: {
    getDashboardLink: () => "/dashboard",
    getDiscussionsLink: () => "/discussions",
    getRulesLink: () => "/rules",
  },
};
