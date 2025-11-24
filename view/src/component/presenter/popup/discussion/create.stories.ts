import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Rule } from "../../../../model/rule";
import type { CreateDiscussionPopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/discussion/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <create-discussion-popup-presenter
        id="popup"
        .rules=${args.rules}
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
  args: {
    rules: [
      { id: "rule1", name: "ディベート標準ルール" } as Rule,
      { id: "rule2", name: "ブレインストーミング" } as Rule,
      { id: "rule3", name: "意思決定プロセス" } as Rule,
    ],
  },
} satisfies Meta<CreateDiscussionPopupPresenter>;

export default meta;
type Story = StoryObj<CreateDiscussionPopupPresenter>;

export const Default: Story = {};
