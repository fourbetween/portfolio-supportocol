import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateProjectPopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/project/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <div>
        <create-project-popup-presenter
          .onCreate=${args.onCreate}
          .onCancel=${args.onCancel}
        ></create-project-popup-presenter>
        <button
          @click=${(e: Event) =>
            (e.target as HTMLElement)
              .closest("div")
              ?.querySelector<CreateProjectPopupPresenter>(
                "create-project-popup-presenter"
              )
              ?.open()}
        >
          ポップアップを開く
        </button>
      </div>
    `,
  argTypes: {
    onCreate: { action: "onCreate" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<CreateProjectPopupPresenter>;

export default meta;
type Story = StoryObj<CreateProjectPopupPresenter>;

export const Default: Story = {};
