import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateDiscussionPopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/discussion/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-discussion-popup-presenter
        id="popup"
      ></create-discussion-popup-presenter>
      <button
        @click=${() =>
          document
            .querySelector<CreateDiscussionPopupPresenter>("#popup")
            ?.open()}
      >
        Open Create Discussion Popup
      </button>
    `,
} satisfies Meta<CreateDiscussionPopupPresenter>;

export default meta;
type Story = StoryObj<CreateDiscussionPopupPresenter>;

export const Default: Story = {};
