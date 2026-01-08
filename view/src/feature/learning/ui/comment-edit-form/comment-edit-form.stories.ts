import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-edit-form";
import type { LearningCommentEditForm } from "./comment-edit-form";

const meta: Meta<LearningCommentEditForm> = {
  title: "learning/ui/comment-edit-form",
  component: "learning-comment-edit-form",
  render: (args) =>
    html`
      <learning-comment-edit-form
        .initialType=${args.initialType}
        .initialContent=${args.initialContent}
        .availableTypes=${args.availableTypes}
        @comment-create=${(e: any) => console.log("create", e)}
        @comment-update=${(e: any) => console.log("update", e)}
        @comment-form-close=${() => console.log("form-close")}
      ></learning-comment-edit-form>
    `,
};

export default meta;

type Story = StoryObj<LearningCommentEditForm>;

export const Default: Story = {
  args: {
    initialType: "質問",
    initialContent: "",
    availableTypes: ["質問", "回答", "アイデア", "賛成", "反対"],
  },
};

export const WithContent: Story = {
  args: {
    initialType: "回答",
    initialContent: "これは回答です。",
    availableTypes: ["質問", "回答", "アイデア", "賛成", "反対"],
  },
};
