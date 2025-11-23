import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateRuleFormPresenter } from "./create";

const meta = {
  title: "presenter/form/rule/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-rule-form-presenter></create-rule-form-presenter>
    `,
} satisfies Meta<CreateRuleFormPresenter>;

export default meta;
type Story = StoryObj<CreateRuleFormPresenter>;

export const Default: Story = {};
