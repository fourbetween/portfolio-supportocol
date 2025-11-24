import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CommentType } from "../../../../model/rule";
import type { CreateCommentPopupPresenter } from "./create";

const commentTypes: CommentType[] = [
  {
    id: "agreement",
    name: "賛成",
    description: "",
    color: "green",
  },
  {
    id: "disagreement",
    name: "反対",
    description: "",
    color: "red",
  },
  {
    id: "question",
    name: "質問",
    description: "",
    color: "blue",
  },
  {
    id: "supplement",
    name: "補足",
    description: "",
    color: "gray",
  },
];

const meta = {
  title: "presenter/popup/comment/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <create-comment-popup-presenter
        id="popup"
        .commentTypes=${args.commentTypes}
      ></create-comment-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<CreateCommentPopupPresenter>("#popup")?.open()}
      >
        Open Popup
      </button>
    `,
  argTypes: {
    commentTypes: { control: "object" },
  },
} satisfies Meta<CreateCommentPopupPresenter>;

export default meta;
type Story = StoryObj<CreateCommentPopupPresenter>;

export const Default: Story = {
  args: {
    commentTypes: commentTypes,
  },
};
