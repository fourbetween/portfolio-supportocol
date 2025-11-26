import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ConfirmPopupPresenter } from "./confirm";

const meta = {
  title: "presenter/popup/confirm",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <confirm-popup-presenter
        id="popup"
        .title=${args.title}
        .message=${args.message}
        .confirmLabel=${args.confirmLabel}
        .cancelLabel=${args.cancelLabel}
        .onConfirm=${args.onConfirm}
        .onCancel=${args.onCancel}
      ></confirm-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<ConfirmPopupPresenter>("#popup")?.open()}
      >
        ポップアップを開く
      </button>
    `,
  argTypes: {
    title: { control: "text" },
    message: { control: "text" },
    confirmLabel: { control: "text" },
    cancelLabel: { control: "text" },
    onConfirm: { action: "onConfirm" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<ConfirmPopupPresenter>;

export default meta;
type Story = StoryObj<ConfirmPopupPresenter>;

export const Default: Story = {
  args: {
    title: "削除確認",
    message: "このプロジェクトを削除してもよろしいですか？",
    confirmLabel: "削除",
    cancelLabel: "キャンセル",
  },
};

export const CustomLabels: Story = {
  args: {
    title: "操作の確認",
    message: "この操作を実行しますか？",
    confirmLabel: "実行",
    cancelLabel: "やめる",
  },
};
