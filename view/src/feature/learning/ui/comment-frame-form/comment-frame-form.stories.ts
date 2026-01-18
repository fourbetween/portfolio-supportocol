import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import type { CommentFrame } from "../../model/comment-frame";
import "./comment-frame-form";
import type { LearningCommentFrameForm } from "./comment-frame-form";

const meta: Meta<LearningCommentFrameForm> = {
  title: "learning/ui/comment-frame-form",
  component: "learning-comment-frame-form",
};

export default meta;

type Story = StoryObj<LearningCommentFrameForm>;

const initialFrame: CommentFrame = {
  types: ["質問", "回答", "アイデア"],
  paths: [
    { child: "回答", parent: "質問" },
    { child: "アイデア", parent: "" },
  ],
};

export const Default: Story = {
  render: () => html`
    <learning-comment-frame-form
      .initialFrame=${initialFrame}
    ></learning-comment-frame-form>
  `,
};

export const Empty: Story = {
  render: () => html`
    <learning-comment-frame-form></learning-comment-frame-form>
  `,
};
