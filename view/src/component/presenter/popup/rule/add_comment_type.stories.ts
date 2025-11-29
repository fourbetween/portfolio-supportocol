import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { AddCommentTypePopupPresenter } from "./add_comment_type";

const meta = {
  title: "presenter/popup/rule/add_comment_type",
  tags: ["autodocs"],
  render: () =>
    html`
      <div>
        <add-comment-type-popup-presenter></add-comment-type-popup-presenter>
        <button
          @click=${(e: Event) =>
            (e.target as HTMLElement)
              .closest("div")
              ?.querySelector<AddCommentTypePopupPresenter>(
                "add-comment-type-popup-presenter"
              )
              ?.open()}
        >
          Open Popup
        </button>
      </div>
    `,
  argTypes: {},
} satisfies Meta<AddCommentTypePopupPresenter>;

export default meta;
type Story = StoryObj<AddCommentTypePopupPresenter>;

export const Default: Story = {};
