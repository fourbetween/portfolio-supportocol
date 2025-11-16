import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Note } from "../../../model/discussion";
import "./note";
import type { NoteListPresenter } from "./note";

const meta = {
  title: "presenter/list/note",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <note-list-presenter .notes=${args.notes}></note-list-presenter>
    `,
  argTypes: {
    notes: { control: "object" },
  },
} satisfies Meta<NoteListPresenter>;

export default meta;
type Story = StoryObj<NoteListPresenter>;

const sampleNotes: Note[] = [
  {
    id: "note1",
    discussionId: "disc1",
    content:
      "Review the new API documentation for potential issues, especially regarding authentication endpoints.",
    postedBy: "user1",
    postedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "note2",
    discussionId: "disc1",
    content: "Add unit tests for the new data validation logic.",
    postedBy: "user2",
    postedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "note3",
    discussionId: "disc1",
    content:
      "Consider edge case: what happens if the user input is an empty string?",
    postedBy: "user3",
    postedAt: "2024-01-03T00:00:00Z",
  },
];

export const Default: Story = {
  args: {
    notes: sampleNotes,
  },
};

export const Empty: Story = {
  args: {
    notes: [],
  },
};

export const SingleNote: Story = {
  args: {
    notes: [sampleNotes[0]],
  },
};

export const ManyNotes: Story = {
  args: {
    notes: [
      ...sampleNotes,
      {
        id: "note4",
        discussionId: "disc1",
        content:
          "Check if the error handling covers all possible network failure scenarios.",
        postedBy: "user4",
        postedAt: "2024-01-04T00:00:00Z",
      },
      {
        id: "note5",
        discussionId: "disc1",
        content: "Update the README with the new configuration options.",
        postedBy: "user5",
        postedAt: "2024-01-05T00:00:00Z",
      },
      {
        id: "note6",
        discussionId: "disc1",
        content:
          "Refactor the database query to improve performance for large datasets.",
        postedBy: "user6",
        postedAt: "2024-01-06T00:00:00Z",
      },
    ],
  },
};
