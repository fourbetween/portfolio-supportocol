import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CommentType } from "../../../../model/rule";
import type { EditCommentTypePopupPresenter } from "./edit_comment_type";

const mockCommentType: CommentType = {
  id: "01234567890123456789012347",
  no: 0,
  name: "主張",
  description: "自分の意見や提案を述べるコメント",
  color: "#0969da",
  root: true,
};

const meta = {
  title: "presenter/popup/rule/edit_comment_type",
  tags: ["autodocs"],
  render: () =>
    html`
      <div>
        <edit-comment-type-popup-presenter></edit-comment-type-popup-presenter>
        <button
          @click=${(e: Event) =>
            (e.target as HTMLElement)
              .closest("div")
              ?.querySelector<EditCommentTypePopupPresenter>(
                "edit-comment-type-popup-presenter"
              )
              ?.open(mockCommentType)}
        >
          Open Popup
        </button>
      </div>
    `,
  argTypes: {},
} satisfies Meta<EditCommentTypePopupPresenter>;

export default meta;
type Story = StoryObj<EditCommentTypePopupPresenter>;

export const Default: Story = {};
