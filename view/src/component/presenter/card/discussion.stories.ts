import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./discussion";
import type {
  DiscussionCardPresenter,
  DiscussionCardProps,
} from "./discussion";

const meta = {
  title: "presenter/card/discussion",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <discussion-card-presenter
        .discussionCard=${args.discussionCard}
      ></discussion-card-presenter>
    `,
  argTypes: {
    discussionCard: { control: "object" },
  },
} satisfies Meta<DiscussionCardPresenter>;

export default meta;
type Story = StoryObj<DiscussionCardPresenter>;

const sampleDiscussionCard: DiscussionCardProps = {
  id: "01234567890123456789012345",
  theme: "How to improve the filtering logic?",
  authorName: "octocat",
  commentCount: 12,
};

export const Default: Story = {
  args: {
    discussionCard: sampleDiscussionCard,
  },
};

export const LongTheme: Story = {
  args: {
    discussionCard: {
      ...sampleDiscussionCard,
      theme:
        "長いテーマの例: 新しいフィルタリングロジックを実装する際のベストプラクティスと考慮すべき点について",
    },
  },
};

export const NoComments: Story = {
  args: {
    discussionCard: {
      ...sampleDiscussionCard,
      commentCount: 0,
    },
  },
};

export const ManyComments: Story = {
  args: {
    discussionCard: {
      ...sampleDiscussionCard,
      commentCount: 999,
    },
  },
};
