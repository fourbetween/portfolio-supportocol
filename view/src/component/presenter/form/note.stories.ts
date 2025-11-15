import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./note";
import type { NoteFormPresenter } from "./note";

const meta = {
  title: "presenter/form/note",
  tags: ["autodocs"],
  render: () =>
    html`
      <note-form-presenter></note-form-presenter>
    `,
} satisfies Meta<NoteFormPresenter>;

export default meta;
type Story = StoryObj<NoteFormPresenter>;

export const Default: Story = {};
