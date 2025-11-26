import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateProjectPopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/project/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <create-project-popup-presenter
        id="popup"
        .onCreate=${args.onCreate}
        .onCancel=${args.onCancel}
      ></create-project-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<CreateProjectPopupPresenter>("#popup")?.open()}
      >
        ポップアップを開く
      </button>
    `,
  argTypes: {
    onCreate: { action: "onCreate" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<CreateProjectPopupPresenter>;

export default meta;
type Story = StoryObj<CreateProjectPopupPresenter>;

export const Default: Story = {
  args: {},
};
