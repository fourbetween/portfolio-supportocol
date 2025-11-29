import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { EditProjectPopupPresenter } from "./edit";

const meta = {
  title: "presenter/popup/project/edit",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <div>
        <edit-project-popup-presenter
          .projectName=${args.projectName}
          .onSave=${args.onSave}
          .onCancel=${args.onCancel}
        ></edit-project-popup-presenter>
        <button
          @click=${(e: Event) =>
            (e.target as HTMLElement)
              .closest("div")
              ?.querySelector<EditProjectPopupPresenter>(
                "edit-project-popup-presenter"
              )
              ?.open()}
        >
          ポップアップを開く
        </button>
      </div>
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
