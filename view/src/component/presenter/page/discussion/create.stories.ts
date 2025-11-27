import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateDiscussionPagePresenter } from "./create";

const mockRules = [
  {
    id: "01234567890123456789012349",
    name: "標準ルール",
    description:
      "標準的な議論のルール。主張、根拠、反論を使った一般的な議論に適しています。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-01T00:00:00Z",
    commentTypes: [
      {
        id: "01234567890123456789012351",
        name: "主張",
        description: "議論の主張を述べる",
        color: "#0969da",
      },
      {
        id: "01234567890123456789012352",
        name: "根拠",
        description: "主張を裏付ける根拠を述べる",
        color: "#2da44e",
      },
      {
        id: "01234567890123456789012353",
        name: "反論",
        description: "主張や根拠に対する反論を述べる",
        color: "#cf222e",
      },
    ],
    commentTypePaths: [],
  },
  {
    id: "01234567890123456789012350",
    name: "厳密ルール",
    description:
      "厳密な論証を行うルール。演繹的推論や形式論理を使った議論に適しています。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-02T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
  {
    id: "01234567890123456789012351",
    name: "ブレインストーミング",
    description:
      "自由なアイデア出しのためのルール。批判を保留し、多くのアイデアを出すことを重視します。",
    createdBy: "01234567890123456789012346",
    createdAt: "2024-01-03T00:00:00Z",
    commentTypes: [],
    commentTypePaths: [],
  },
];

const meta = {
  title: "presenter/page/discussion/create",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <create-discussion-page-presenter
        .rules=${args.rules}
        .onSubmit=${args.onSubmit}
        .onCancel=${args.onCancel}
      ></create-discussion-page-presenter>
    `,
  argTypes: {
    onSubmit: { action: "onSubmit" },
    onCancel: { action: "onCancel" },
  },
} satisfies Meta<CreateDiscussionPagePresenter>;

export default meta;
type Story = StoryObj<CreateDiscussionPagePresenter>;

export const Default: Story = {
  args: {
    rules: mockRules,
  },
};

export const NoRules: Story = {
  args: {
    rules: [],
  },
};

export const SingleRule: Story = {
  args: {
    rules: [mockRules[0]],
  },
};
