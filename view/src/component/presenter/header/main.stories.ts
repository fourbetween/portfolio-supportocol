import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./main";
import type { MainHeaderPresenter } from "./main";

const meta = {
  title: "presenter/header/main",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <main-header-presenter
        .currentPath=${args.currentPath}
      ></main-header-presenter>
    `,
  argTypes: {
    currentPath: { control: "text" },
  },
} satisfies Meta<MainHeaderPresenter>;

export default meta;
type Story = StoryObj<MainHeaderPresenter>;

export const Default: Story = {
  args: {
    currentPath: "/view/sample/page/dashboard.html",
  },
};

export const ProjectActive: Story = {
  args: {
    currentPath: "/view/sample/page/project/list.html",
  },
};
