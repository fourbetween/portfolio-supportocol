import createClient from "openapi-fetch";
import { loadingMiddleware } from "../../../shared/api/loading-middleware";
import type { paths } from "./schema";

export const client = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: "include",
});

client.use(loadingMiddleware);
