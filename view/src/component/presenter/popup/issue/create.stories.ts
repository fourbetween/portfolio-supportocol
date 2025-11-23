import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateIssuePopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/issue/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-issue-popup-presenter id="popup"></create-issue-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<CreateIssuePopupPresenter>("#popup")?.open()}
      >
        Open Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<CreateIssuePopupPresenter>;

export default meta;
type Story = StoryObj<CreateIssuePopupPresenter>;

export const Default: Story = {
  args: {},
};
