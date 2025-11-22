import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./delete";
import type { DeleteProjectPopupPresenter } from "./delete";

const meta = {
  title: "presenter/popup/project/delete",
  tags: ["autodocs"],
  render: () =>
    html`
      <delete-project-popup-presenter
        id="popup"
        .project=${{
          id: "01H2X3J4K5L6M7N8P9Q0R1S2T3",
          name: "AI倫理ガイドライン策定プロジェクト",
          createdBy: "01H2X3J4K5L6M7N8P9Q0R1S2T3",
          createdAt: "2023-01-01T00:00:00Z",
        }}
      ></delete-project-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<DeleteProjectPopupPresenter>("#popup")?.open()}
      >
        Open Delete Project Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<DeleteProjectPopupPresenter>;

export default meta;
type Story = StoryObj<DeleteProjectPopupPresenter>;

export const Default: Story = {
  args: {},
};
