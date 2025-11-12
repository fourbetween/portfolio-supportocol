import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { pwaPlugin } from "./plugin/pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: true,
      allowedHosts: [".hick-r.com"],
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
      },
    },
    plugins: [pwaPlugin(mode)],
    test: {
      browser: {
        enabled: true,
        headless: true,
        instances: [{ browser: "chromium" }],
        provider: playwright({}),
      },
      testTimeout: 100,
      setupFiles: ["./vitest.setup.ts"],
    },
  };
});
