import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import type { AuthPopupPresenter } from "./auth";

const meta = {
  title: "presenter/popup/auth",
  tags: ["autodocs"],
  render: (args) =>
    html`
      <div>
        <auth-popup-presenter
          .mode=${args.mode}
          .selfSignupEnabled=${args.selfSignupEnabled}
          .onLogin=${args.onLogin}
          .onSignup=${args.onSignup}
          .onSwitchMode=${args.onSwitchMode}
        ></auth-popup-presenter>
        <button
          @click=${(e: Event) =>
            (e.target as HTMLElement)
              .closest("div")
              ?.querySelector<AuthPopupPresenter>("auth-popup-presenter")
              ?.open()}
        >
          ポップアップを開く
        </button>
      </div>
    `,
  argTypes: {
    mode: {
      control: { type: "select" },
      options: ["login", "signup"],
    },
    onLogin: { action: "login" },
    onSignup: { action: "signup" },
    onSwitchMode: { action: "switchMode" },
  },
} satisfies Meta<AuthPopupPresenter>;

export default meta;
type Story = StoryObj<AuthPopupPresenter>;

export const Login: Story = {
  args: {
    mode: "login",
    selfSignupEnabled: true,
  },
};

export const Signup: Story = {
  args: {
    mode: "signup",
  },
};

export const LoginSignupDisabled: Story = {
  args: {
    mode: "login",
    selfSignupEnabled: false,
  },
};
