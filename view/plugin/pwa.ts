import { VitePWA } from "vite-plugin-pwa";
import { paths } from "../src/app/paths";

export const pwaPlugin = (mode: string) => {
  const globPatterns = ["*.js"];
  if (["prod", "demo"].includes(mode)) {
    globPatterns.push("assets/**/*", "images/**/*", "index.html");
  }
  return VitePWA({
    devOptions: { enabled: true },
    registerType: "autoUpdate",
    injectRegister: "auto",
    includeAssets: [],
    includeManifestIcons: false,
    workbox: {
      globPatterns: globPatterns,
      importScripts: [],
    },
    manifest: {
      icons: [
        {
          src: "/images/logo_512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/images/logo_192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/images/logo.webp",
          sizes: "375x375",
          type: "image/webp",
          purpose: "maskable",
        },
      ],
      name: "Supportocol",
      short_name: "Supportocol",
      description: "A platform for logical discussion",
      start_url: paths.learning.dashboard,
      theme_color: "#000000",
    },
  });
};
