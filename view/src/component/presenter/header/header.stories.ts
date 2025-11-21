import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./header";
import type { HeaderPresenter } from "./header";

const meta = {
  title: "presenter/header",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <header-presenter .currentPath=${args.currentPath}></header-presenter>
    `,
  argTypes: {
    currentPath: { control: "text" },
  },
} satisfies Meta<HeaderPresenter>;

export default meta;
type Story = StoryObj<HeaderPresenter>;

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
