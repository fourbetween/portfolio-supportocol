import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./create";
import type { CreateProjectPopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/project/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-project-popup-presenter
        id="popup"
      ></create-project-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<CreateProjectPopupPresenter>("#popup")?.open()}
      >
        Open Create Project Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<CreateProjectPopupPresenter>;

export default meta;
type Story = StoryObj<CreateProjectPopupPresenter>;

export const Default: Story = {
  args: {},
};
