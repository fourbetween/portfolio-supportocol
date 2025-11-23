import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Discussion } from "../../../../model/discussion";
import type { SettingsDiscussionFormPresenter } from "./settings";

const discussion: Discussion = {
  id: "01J8Y000000000000000000001",
  theme: "AIは人間の仕事を奪うか？",
  background:
    "近年、生成AIの技術革新により、クリエイティブな領域を含む多くの仕事がAIに代替される可能性が議論されています。この議論では、AIが雇用に与える影響について、ポジティブ・ネガティブ両面から検討します。",
  conclusion: "",
  ruleId: "rule1",
  visibilityLevel: "everyone",
  commentPermissionLevel: "authenticated",
  createdBy: "user1",
  createdAt: "2023-10-01T00:00:00Z",
  status: "open",
};

const meta = {
  title: "presenter/form/discussion/settings",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <settings-discussion-form-presenter
        .discussion=${args.discussion}
      ></settings-discussion-form-presenter>
    `,
  argTypes: {
    discussion: { control: "object" },
  },
} satisfies Meta<SettingsDiscussionFormPresenter>;

export default meta;
type Story = StoryObj<SettingsDiscussionFormPresenter>;

export const Default: Story = {
  args: {
    discussion: discussion,
  },
};
