import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./main";
import type { MainLayoutContainer } from "./main";

const meta = {
  title: "container/layout/main",
  tags: ["autodocs"],
  render: (args) => html`
    <main-layout-container .isLoggedIn=${args.isLoggedIn}>
      <div style="padding: 24px; color: #c9d1d9;">
        <h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 600;">
          ページコンテンツ
        </h1>
        <p style="margin: 0; line-height: 1.6;">
          これはメインレイアウトコンテナのサンプルです。ヘッダーはすべてのページで共通して表示されます。
        </p>
      </div>
    </main-layout-container>
  `,
  argTypes: {
    isLoggedIn: { control: "boolean" },
  },
} satisfies Meta<MainLayoutContainer>;

export default meta;
type Story = StoryObj<MainLayoutContainer>;

export const Default: Story = {
  args: {
    isLoggedIn: false,
  },
};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
  },
};
