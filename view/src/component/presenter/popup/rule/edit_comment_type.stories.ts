import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CommentType } from "../../../../model/rule";
import type { EditCommentTypePopupPresenter } from "./edit_comment_type";

const mockCommentType: CommentType = {
  id: "01234567890123456789012347",
  name: "主張",
  description: "自分の意見や提案を述べるコメント",
  color: "#0969da",
};

const meta = {
  title: "presenter/popup/rule/edit_comment_type",
  tags: ["autodocs"],
  render: () =>
    html`
      <edit-comment-type-popup-presenter
        id="popup"
      ></edit-comment-type-popup-presenter>
      <button
        @click=${() =>
          document
            .querySelector<EditCommentTypePopupPresenter>("#popup")
            ?.open(mockCommentType)}
      >
        Open Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<EditCommentTypePopupPresenter>;

export default meta;
type Story = StoryObj<EditCommentTypePopupPresenter>;

export const Default: Story = {
  args: {},
};
