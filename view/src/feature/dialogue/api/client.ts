import createClient, { type Middleware } from "openapi-fetch";
import { authService } from "../../identity/model/auth-service";
import type { paths } from "./schema";

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
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
