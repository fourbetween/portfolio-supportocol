import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateIssuePopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/issue/create",
  tags: ["autodocs"],
  render: (args) => html`
    <create-issue-popup-presenter
      .onCreate=${args.onCreate}
    ></create-issue-popup-presenter>
    <button
      id="open-popup"
      @click=${() => {
        const popup = document.querySelector(
          "create-issue-popup-presenter"
        ) as CreateIssuePopupPresenter;
        popup?.open();
      }}
    >
      ポップアップを開く
    </button>
  `,
  argTypes: {
    onCreate: { action: "onCreate" },
  },
} satisfies Meta<CreateIssuePopupPresenter>;

export default meta;
type Story = StoryObj<CreateIssuePopupPresenter>;

export const Default: Story = {
  args: {},
};
