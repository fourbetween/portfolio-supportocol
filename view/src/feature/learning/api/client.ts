import createClient, { type Middleware } from "openapi-fetch";
import { auth } from "../../identity/util/auth";
import type { paths } from "./schema";

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 401) {
      auth.login();
      return;
    }
  },
};

client.use(middleware);
