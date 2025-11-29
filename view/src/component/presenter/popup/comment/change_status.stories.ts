import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ChangeStatusPopupPresenter } from "./change_status";

const meta = {
  title: "presenter/popup/comment/change_status",
  tags: ["autodocs"],
  render: (args) => html`
    <change-status-popup-presenter
      .currentStatus=${args.currentStatus}
      .onChangeStatus=${args.onChangeStatus}
    ></change-status-popup-presenter>
    <button
      id="open-popup"
      @click=${() => {
        const popup = document.querySelector(
          "change-status-popup-presenter"
        ) as ChangeStatusPopupPresenter;
        popup?.open();
      }}
    >
      ポップアップを開く
    </button>
  `,
  argTypes: {
    currentStatus: {
      control: { type: "select" },
      options: ["unassigned", "assigned", "archived", "deleted"],
    },
    onChangeStatus: { action: "onChangeStatus" },
  },
} satisfies Meta<ChangeStatusPopupPresenter>;

export default meta;
type Story = StoryObj<ChangeStatusPopupPresenter>;

export const Unassigned: Story = {
  args: {
    currentStatus: "unassigned",
  },
};

export const Assigned: Story = {
  args: {
    currentStatus: "assigned",
  },
};

export const Archived: Story = {
  args: {
    currentStatus: "archived",
  },
};

export const Deleted: Story = {
  args: {
    currentStatus: "deleted",
  },
};
