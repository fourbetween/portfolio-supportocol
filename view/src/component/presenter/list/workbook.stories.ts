import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { Workbook } from "../../../model/workbook";
import "./workbook";
import type { WorkbookListPresenter } from "./workbook";

const meta = {
  title: "presenter/list/workbook",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <workbook-list-presenter
        .workbooks=${args.workbooks}
      ></workbook-list-presenter>
    `,
  argTypes: {
    workbooks: { control: "object" },
  },
} satisfies Meta<WorkbookListPresenter>;

export default meta;
type Story = StoryObj<WorkbookListPresenter>;

const sampleWorkbooks: Workbook[] = [
  {
    id: "01234567890123456789012345",
    title: "サンプルワークブック 1",
    status: "published",
  },
  {
    id: "01234567890123456789012346",
    title: "サンプルワークブック 2",
    status: "draft",
  },
  {
    id: "01234567890123456789012347",
    title: "サンプルワークブック 3",
    status: "published",
  },
];

export const Default: Story = {
  args: {
    workbooks: sampleWorkbooks,
  },
};

export const Empty: Story = {
  args: {
    workbooks: [],
  },
};

export const SingleItem: Story = {
  args: {
    workbooks: [sampleWorkbooks[0]],
  },
};

export const ManyItems: Story = {
  args: {
    workbooks: [
      ...sampleWorkbooks,
      {
        id: "01234567890123456789012348",
        title: "サンプルワークブック 4",
        status: "published",
      },
      {
        id: "01234567890123456789012349",
        title: "サンプルワークブック 5",
        status: "draft",
      },
      {
        id: "01234567890123456789012350",
        title: "サンプルワークブック 6",
        status: "published",
      },
    ],
  },
};
