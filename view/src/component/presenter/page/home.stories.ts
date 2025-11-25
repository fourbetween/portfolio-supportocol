import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { fn } from "storybook/test";

const meta = {
  title: "Page/HomePagePresenter",
  tags: ["autodocs"],
  render: (args) => html`
    <home-page-presenter
      .onLoginCallback=${args.onLoginCallback}
    ></home-page-presenter>
  `,
  argTypes: {
    onLoginCallback: { action: "onLoginCallback" },
  },
  args: {
    onLoginCallback: fn(),
  },
} satisfies Meta<{
  onLoginCallback: () => void;
}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
