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
        .getProjectsLink=${args.getProjectsLink}
        .getDiscussionsLink=${args.getDiscussionsLink}
        .getRulesLink=${args.getRulesLink}
      ></main-header-presenter>
    `,
  argTypes: {
    getDashboardLink: { control: false },
    getProjectsLink: { control: false },
    getDiscussionsLink: { control: false },
    getRulesLink: { control: false },
  },
} satisfies Meta<MainHeaderPresenter>;

export default meta;
type Story = StoryObj<MainHeaderPresenter>;

export const Default: Story = {
  args: {
    getDashboardLink: () => "/dashboard",
    getProjectsLink: () => "/projects",
    getDiscussionsLink: () => "/discussions",
    getRulesLink: () => "/rules",
  },
};
