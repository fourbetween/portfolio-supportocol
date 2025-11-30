import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { BaseToastPresenter } from "./base";

const meta = {
  title: "presenter/toast/base",
  tags: ["autodocs"],
  render: () =>
    html`
      <div style="min-height: 200px;">
        <base-toast-presenter id="toast"></base-toast-presenter>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button
            @click=${() => {
              const toast = document.getElementById(
                "toast"
              ) as BaseToastPresenter;
              toast?.show({
                message: "成功しました！",
                type: "success",
                duration: 5000,
              });
            }}
          >
            Success Toast
          </button>
          <button
            @click=${() => {
              const toast = document.getElementById(
                "toast"
              ) as BaseToastPresenter;
              toast?.show({
                message: "エラーが発生しました。",
                type: "error",
                duration: 5000,
              });
            }}
          >
            Error Toast
          </button>
          <button
            @click=${() => {
              const toast = document.getElementById(
                "toast"
              ) as BaseToastPresenter;
              toast?.show({
                message: "お知らせがあります。",
                type: "info",
                duration: 5000,
              });
            }}
          >
            Info Toast
          </button>
          <button
            @click=${() => {
              const toast = document.getElementById(
                "toast"
              ) as BaseToastPresenter;
              toast?.show({
                message: "注意してください。",
                type: "warning",
                duration: 5000,
              });
            }}
          >
            Warning Toast
          </button>
        </div>
      </div>
    `,
  argTypes: {},
} satisfies Meta<BaseToastPresenter>;

export default meta;
type Story = StoryObj<BaseToastPresenter>;

export const Default: Story = {};
