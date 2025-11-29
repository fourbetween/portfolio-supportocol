import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Issue } from "../../../../model/discussion";
import type { ListIssuePopupPresenter } from "./list";

const mockIssues: Issue[] = [
  {
    id: "01234567890123456789012370",
    commentId: "01234567890123456789012360",
    issueType: "contradiction",
    description:
      "この主張は前提となる根拠と矛盾しています。根拠では「A」と述べていますが、主張では「Aではない」と述べています。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T14:00:00Z",
  },
  {
    id: "01234567890123456789012371",
    commentId: "01234567890123456789012360",
    issueType: "circular_logic",
    description:
      "論点先取りが発生しています。主張を証明するために、主張自体を前提として使用しています。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T15:00:00Z",
  },
];

const meta = {
  title: "presenter/popup/issue/list",
  tags: ["autodocs"],
  render: (args) => html`
    <div>
      <list-issue-popup-presenter
        .issues=${args.issues}
      ></list-issue-popup-presenter>
      <button
        @click=${(e: Event) =>
          (e.target as HTMLElement)
            .closest("div")
            ?.querySelector<ListIssuePopupPresenter>(
              "list-issue-popup-presenter"
            )
            ?.open()}
      >
        ポップアップを開く
      </button>
    </div>
  `,
  argTypes: {},
} satisfies Meta<ListIssuePopupPresenter>;

export default meta;
type Story = StoryObj<ListIssuePopupPresenter>;

export const Default: Story = {
  args: {
    issues: mockIssues,
  },
};

export const SingleIssue: Story = {
  args: {
    issues: [mockIssues[0]],
  },
};

export const Empty: Story = {
  args: {
    issues: [],
  },
};
