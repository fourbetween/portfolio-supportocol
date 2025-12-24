import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { pwaPlugin } from "./plugin/pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === "test") {
    return {
      test: {
        browser: {
          enabled: true,
          headless: true,
          instances: [{ browser: "chromium" }],
          provider: playwright({}),
        },
        testTimeout: 500,
        setupFiles: [".storybook/vitest.setup.ts"],
      },
    };
  }
  return {
    server: {
      port: 3000,
      host: true,
      allowedHosts: [".hick-r.com"],
    },
    plugins: [pwaPlugin(mode)],
  };
});
