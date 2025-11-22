import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./create";
import type { CreateDiscussionFormPresenter } from "./create";

const meta = {
  title: "presenter/form/discussion/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-discussion-form-presenter></create-discussion-form-presenter>
    `,
} satisfies Meta<CreateDiscussionFormPresenter>;

export default meta;
type Story = StoryObj<CreateDiscussionFormPresenter>;

export const Default: Story = {};
