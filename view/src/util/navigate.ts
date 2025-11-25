import type { Router } from "@lit-labs/router";

export const navigate = async (router: Router, path: string) => {
  await router.goto(path);
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.pathname = path;
  window.history.pushState({}, "", url.toString());
};
