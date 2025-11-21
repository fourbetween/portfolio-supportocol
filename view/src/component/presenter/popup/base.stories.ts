import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./base";
import type { BasePopupPresenter } from "./base";

const meta = {
  title: "presenter/popup/base",
  tags: ["autodocs"],
  render: () =>
    html`
      <base-popup-presenter id="popup">
        <span slot="header">Header Content</span>
        <div slot="main">
          <p>This is the main content of the popup.</p>
          <p>It can contain any HTML.</p>
        </div>
        <button slot="footer">Action</button>
        <button slot="footer">Cancel</button>
      </base-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<BasePopupPresenter>("#popup")?.open()}
      >
        Open Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<BasePopupPresenter>;

export default meta;
type Story = StoryObj<BasePopupPresenter>;

export const Default: Story = {
  args: {},
};
