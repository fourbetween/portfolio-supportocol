import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { CreateNotePopupPresenter } from "./create";

const meta = {
  title: "presenter/popup/note/create",
  tags: ["autodocs"],
  render: () =>
    html`
      <create-note-popup-presenter id="popup"></create-note-popup-presenter>
      <button
        @click=${() =>
          document.querySelector<CreateNotePopupPresenter>("#popup")?.open()}
      >
        Open Create Note Popup
      </button>
    `,
  argTypes: {},
} satisfies Meta<CreateNotePopupPresenter>;

export default meta;
type Story = StoryObj<CreateNotePopupPresenter>;

export const Default: Story = {
  args: {},
};
