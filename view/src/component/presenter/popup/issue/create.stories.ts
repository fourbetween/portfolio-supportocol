import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateIssuePopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/issue/create",
  tags: ["autodocs"],
  render: (args) => html`
    <div>
      <create-issue-popup-presenter
        .onCreate=${args.onCreate}
      ></create-issue-popup-presenter>
      <button
        @click=${(e: Event) =>
          (e.target as HTMLElement)
            .closest("div")
            ?.querySelector<CreateIssuePopupPresenter>(
              "create-issue-popup-presenter"
            )
            ?.open()}
      >
        ポップアップを開く
      </button>
    </div>
  `,
  argTypes: {
    onCreate: { action: "onCreate" },
  },
} satisfies Meta<CreateIssuePopupPresenter>;

export default meta;
type Story = StoryObj<CreateIssuePopupPresenter>;

export const Default: Story = {};
