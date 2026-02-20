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
          screenshotFailures: false,
        },
        testTimeout: 2000,
        setupFiles: [".storybook/vitest.setup.ts"],
      },
    };
  }
  return {
    server: {
      port: 3000,
      host: true,
      allowedHosts: ["*.dev.hick-r.com"],
    },
    plugins: [
      pwaPlugin(mode),
      // visualizer({
      //   open: false,
      //   filename: "stats.html",
      //   gzipSize: true,
      //   brotliSize: true,
      // }),
    ],
  };
});
