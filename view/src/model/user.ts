import type z from "zod";
import { client } from "../api/client";
import type { UserSchema } from "../api/schema/schema";
import { openAuthPopup } from "../event/auth";

export type User = z.infer<typeof UserSchema>;

export const authMethods = {
  login: () => {
    openAuthPopup(document.body);
  },
  logout: async () => {
    await client.POST("/auth/logout", {});
    window.location.href = "/";
  },
  getCurrentUser: async () => {
    const { data, error } = await client.GET("/me", {});
    if (error) {
      return null;
    }
    return data;
  },
};
