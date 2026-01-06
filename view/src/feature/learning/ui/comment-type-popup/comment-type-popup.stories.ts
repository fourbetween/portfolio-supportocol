import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import "./comment-type-popup";
import type { LearningCommentTypePopup } from "./comment-type-popup";

const meta: Meta<LearningCommentTypePopup> = {
  title: "learning/ui/comment-type-popup",
  component: "learning-comment-type-popup",
};

export default meta;
type Story = StoryObj<LearningCommentTypePopup>;

export const Default: Story = {
  args: {
    types: ["Question", "Idea", "Agreement", "Disagreement", "Proposal"],
  },
  render: (args) => html`
    <button
      class="btn"
      @click=${() =>
        (document.querySelector("learning-comment-type-popup") as any).open()}
    >
      Open Popup
    </button>
    <learning-comment-type-popup
      .types=${args.types}
    ></learning-comment-type-popup>
  `,
};
