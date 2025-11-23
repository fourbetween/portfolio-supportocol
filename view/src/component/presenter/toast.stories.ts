import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { ToastPresenter } from "./toast";

const meta = {
  title: "presenter/toast",
  tags: ["autodocs"],
  render: () => html`
    <div>
      <toast-presenter></toast-presenter>
      <div style="padding: 20px;">
        <h2>Toast Presenter Demo</h2>
        <p>トーストメッセージを表示するコンポーネントです。</p>
        <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
          <button
            class="btn btn-primary"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                (toast as unknown as ToastPresenter).show("操作が正常に完了しました", "success");
              }
            }}
          >
            成功メッセージ
          </button>
          <button
            class="btn"
            style="background-color: #cf222e; color: white;"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                (toast as unknown as ToastPresenter).show("エラーが発生しました", "error");
              }
            }}
          >
            エラーメッセージ
          </button>
          <button
            class="btn"
            style="background-color: #bf8700; color: white;"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                (toast as unknown as ToastPresenter).show("注意してください", "warning");
              }
            }}
          >
            警告メッセージ
          </button>
          <button
            class="btn"
            style="background-color: #0969da; color: white;"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                (toast as unknown as ToastPresenter).show("情報をお知らせします", "info");
              }
            }}
          >
            情報メッセージ
          </button>
          <button
            class="btn"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                (toast as unknown as ToastPresenter).show("これは長いメッセージのサンプルです。複数行にわたる場合でも適切に表示されることを確認します。", "info");
              }
            }}
          >
            長いメッセージ
          </button>
          <button
            class="btn"
            @click=${(e: Event) => {
              const root = (e.target as HTMLElement).closest("div");
              const toast = root?.querySelector("toast-presenter");
              if (toast) {
                const toastPresenter = toast as unknown as ToastPresenter;
                toastPresenter.show("メッセージ1", "success");
                setTimeout(() => toastPresenter.show("メッセージ2", "info"), 500);
                setTimeout(() => toastPresenter.show("メッセージ3", "warning"), 1000);
              }
            }}
          >
            複数のトースト
          </button>
        </div>
      </div>
    </div>
  `,
} satisfies Meta<ToastPresenter>;

export default meta;
type Story = StoryObj<ToastPresenter>;

export const Default: Story = {};
