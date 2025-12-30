import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-detail";

const meta: Meta = {
  title: "learning/ui/comment-frame-detail",
  component: "learning-comment-frame-detail",
};

export default meta;

type Story = StoryObj;

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
