import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import { authService } from "../model/auth";

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});

const middleware: Middleware = {
  async onResponse({ response }) {
    if (response.status === 401) {
      authService.login();
      return;
    }
  },
};

client.use(middleware);
