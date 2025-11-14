import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./header";
import type { HeaderPresenter } from "./header";

const meta = {
  title: "presenter/layout/header",
  tags: ["autodocs"],
  render: () =>
    html`
      <header-presenter></header-presenter>
    `,
} satisfies Meta<HeaderPresenter>;

export default meta;
type Story = StoryObj<HeaderPresenter>;

export const Default: Story = {};
