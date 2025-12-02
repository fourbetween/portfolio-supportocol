import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateCommentPopupPresenter } from "./create";

const mockCommentTypes = [
  {
    id: "01234567890123456789012351",
    no: 0,
    name: "主張",
    description: "議論の主張を述べる",
    color: "#0969da",
    root: true,
  },
  {
    id: "01234567890123456789012352",
    no: 1,
    name: "根拠",
    description: "主張を裏付ける根拠を述べる",
    color: "#2da44e",
    root: false,
  },
  {
    id: "01234567890123456789012353",
    no: 2,
    name: "反論",
    description: "主張や根拠に対する反論を述べる",
    color: "#cf222e",
    root: false,
  },
];

const mockRule = {
  id: "01234567890123456789012349",
  name: "議論ルール",
  description: "議論のルール説明文",
  createdBy: "01234567890123456789012346",
  createdAt: "2024-01-01T00:00:00Z",
  commentTypes: mockCommentTypes,
  commentTypePaths: [
    {
      // 根拠（子）→ 主張（親）：主張に対して根拠で返信可能
      childCommentTypeId: "01234567890123456789012352",
      parentCommentTypeId: "01234567890123456789012351",
    },
    {
      // 反論（子）→ 主張（親）：主張に対して反論で返信可能
      childCommentTypeId: "01234567890123456789012353",
      parentCommentTypeId: "01234567890123456789012351",
    },
  ],
};

const meta = {
  title: "presenter/popup/comment/create",
  tags: ["autodocs"],
  render: (args) => html`
    <div>
      <create-comment-popup-presenter
        .commentTypes=${args.commentTypes}
        .parentCommentId=${args.parentCommentId}
        .rule=${args.rule}
        .fromCommentTypeId=${args.fromCommentTypeId}
        .onCreate=${args.onCreate}
      ></create-comment-popup-presenter>
      <button
        @click=${(e: Event) =>
          (e.target as HTMLElement)
            .closest("div")
            ?.querySelector<CreateCommentPopupPresenter>(
              "create-comment-popup-presenter"
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
} satisfies Meta<CreateCommentPopupPresenter>;

export default meta;
type Story = StoryObj<CreateCommentPopupPresenter>;

export const NewComment: Story = {
  args: {
    commentTypes: mockCommentTypes,
    parentCommentId: null,
  },
};

export const NewCommentWithRule: Story = {
  args: {
    commentTypes: mockCommentTypes,
    parentCommentId: null,
    rule: mockRule,
    fromCommentTypeId: "",
  },
};

export const ReplyComment: Story = {
  args: {
    commentTypes: mockCommentTypes,
    parentCommentId: "01234567890123456789012360",
  },
};

export const ReplyCommentWithRule: Story = {
  args: {
    commentTypes: mockCommentTypes,
    parentCommentId: "01234567890123456789012360",
    rule: mockRule,
    fromCommentTypeId: "01234567890123456789012351", // 主張からの返信
  },
};
