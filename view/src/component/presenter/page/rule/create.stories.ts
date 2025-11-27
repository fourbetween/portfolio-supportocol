import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateRulePagePresenter } from "./create";

const meta = {
  title: "presenter/page/rule/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <create-rule-page-presenter
        .onSave=${args.onSave}
        .onCancel=${args.onCancel}
      ></create-rule-page-presenter>
    `,
  argTypes: {
    onSave: { action: "onSave" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<CreateRulePagePresenter>;

export default meta;
type Story = StoryObj<CreateRulePagePresenter>;

export const Default: Story = {
  args: {},
};
