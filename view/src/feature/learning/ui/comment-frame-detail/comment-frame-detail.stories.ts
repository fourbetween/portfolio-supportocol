import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-detail";
import type { LearningCommentFrameDetail } from "./comment-frame-detail";

const meta: Meta<LearningCommentFrameDetail> = {
  title: "learning/ui/comment-frame-detail",
  component: "learning-comment-frame-detail",
};

export default meta;

type Story = StoryObj<LearningCommentFrameDetail>;

const frame: CommentFrame = {
  types: ["質問", "回答", "アイデア", "賛成"],
  paths: [
    { child: "回答", parent: "質問" },
    { child: "アイデア", parent: "回答" },
    { child: "賛成", parent: "アイデア" },
  ],
};

export const Default: Story = {
  render: () => html`
    <learning-comment-frame-detail
      .frame=${frame}
    ></learning-comment-frame-detail>
  `,
};

export const Grouped: Story = {
  render: () => html`
    <learning-comment-frame-detail
      .frame=${{
        types: ["質問", "回答", "補足", "反対"],
        paths: [
          { child: "回答", parent: "質問" },
          { child: "補足", parent: "質問" },
          { child: "反対", parent: "質問" },
        ],
      }}
    ></learning-comment-frame-detail>
  `,
};

export const WithRoot: Story = {
  render: () => html`
    <learning-comment-frame-detail
      .frame=${{
        types: ["質問", ""],
        paths: [{ child: "質問", parent: "" }],
      }}
    ></learning-comment-frame-detail>
  `,
};
