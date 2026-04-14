import type { Middleware } from "openapi-fetch";
import { LoadingShowEvent } from "../event/loading";

let activeCount = 0;

function isWriteMethod(method: string): boolean {
  return method !== "GET" && method !== "HEAD";
}

export const loadingMiddleware: Middleware = {
  onRequest({ request }) {
    if (isWriteMethod(request.method)) {
      activeCount++;
      if (activeCount === 1) {
        document.dispatchEvent(new LoadingShowEvent(true));
      }
    }
    return undefined;
  },
  onResponse({ request }) {
    if (isWriteMethod(request.method)) {
      activeCount = Math.max(0, activeCount - 1);
      if (activeCount === 0) {
        document.dispatchEvent(new LoadingShowEvent(false));
      }
    }
    return undefined;
  },
  onError({ request }) {
    if (isWriteMethod(request.method)) {
      activeCount = Math.max(0, activeCount - 1);
      if (activeCount === 0) {
        document.dispatchEvent(new LoadingShowEvent(false));
      }
    }
    return undefined;
  },
};
