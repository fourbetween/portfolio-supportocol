import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./project";
import type { ProjectFormPresenter } from "./project";

const meta = {
  title: "presenter/form/project",
  tags: ["autodocs"],
  render: () =>
    html`
      <project-form-presenter></project-form-presenter>
    `,
} satisfies Meta<ProjectFormPresenter>;

export default meta;
type Story = StoryObj<ProjectFormPresenter>;

export const Default: Story = {};
