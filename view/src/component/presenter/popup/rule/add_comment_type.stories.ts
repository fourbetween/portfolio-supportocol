import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./add_comment_type";
import type { AddCommentTypePopupPresenter } from "./add_comment_type";

const meta = {
  title: "presenter/popup/rule/add_comment_type",
  tags: ["autodocs"],
  render: () =>
    html`
      <add-comment-type-popup-presenter
        id="popup"
      ></add-comment-type-popup-presenter>
      <button
        @click=${() =>
          document
            .querySelector<AddCommentTypePopupPresenter>("#popup")
            ?.open()}
      >
        Open Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<AddCommentTypePopupPresenter>;

export default meta;
type Story = StoryObj<AddCommentTypePopupPresenter>;

export const Default: Story = {
  args: {},
};
