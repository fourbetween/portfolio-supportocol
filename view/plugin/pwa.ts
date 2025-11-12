import { VitePWA } from "vite-plugin-pwa";

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
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
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
      name: "Tmpl App",
      short_name: "TmplApp",
      description: "テンプレートとしてのサンプルアプリです。",
      lang: "ja",
      start_url: "/",
      theme_color: "#000000",
    },
  });
};
