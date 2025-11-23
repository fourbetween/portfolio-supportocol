import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Discussion } from "../../../../model/discussion";
import type { AddDiscussionPopupPresenter } from "./add_discussion";

const discussions: Discussion[] = [
  {
    id: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
    theme: "リモートワーク推奨期間の延長に関する是非",
    background: "",
    conclusion: "",
    ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "user2",
    createdAt: "2023-01-01T00:00:00Z",
    status: "open",
  },
  {
    id: "01H1V2W3X4Y5Z6A7B8C9D0E1F3",
    theme: "2024年度 新規事業アイデア募集",
    background: "",
    conclusion: "",
    ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "manager",
    createdAt: "2023-01-02T00:00:00Z",
    status: "archived",
  },
  {
    id: "01H1V2W3X4Y5Z6A7B8C9D0E1F4",
    theme: "オフィス移転プロジェクト",
    background: "",
    conclusion: "",
    ruleId: "01H1V2W3X4Y5Z6A7B8C9D0E1F2",
    visibilityLevel: "everyone",
    commentPermissionLevel: "everyone",
    createdBy: "admin",
    createdAt: "2023-01-03T00:00:00Z",
    status: "closed",
  },
];

const meta = {
  title: "presenter/popup/project/add_discussion",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <add-discussion-popup-presenter
        id="popup"
        .discussions=${args.discussions}
      ></add-discussion-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<AddDiscussionPopupPresenter>("#popup")?.open()}
      >
        Open Add Discussion Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<AddDiscussionPopupPresenter>;

export default meta;
type Story = StoryObj<AddDiscussionPopupPresenter>;

export const Default: Story = {
  args: {
    discussions: discussions,
  },
};
