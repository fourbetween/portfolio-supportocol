import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { EditProjectPopupPresenter } from "./edit-project";

const meta = {
  title: "presenter/popup/edit-project",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <edit-project-popup-presenter
        id="popup"
        .projectName=${args.projectName}
        .onSave=${args.onSave}
        .onCancel=${args.onCancel}
      ></edit-project-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<EditProjectPopupPresenter>("#popup")?.open()}
      >
        ポップアップを開く
      </button>
    `,
  argTypes: {
    projectName: { control: "text" },
    onSave: { action: "onSave" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<EditProjectPopupPresenter>;

export default meta;
type Story = StoryObj<EditProjectPopupPresenter>;

export const Default: Story = {
  args: {
    projectName: "サンプルプロジェクト",
  },
};

export const Empty: Story = {
  args: {
    projectName: "",
  },
};
