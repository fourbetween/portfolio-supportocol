import { client } from "../api/identity/client";
import { openAuthPopup } from "../event/auth";

export type User = {};

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
