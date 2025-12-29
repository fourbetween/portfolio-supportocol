import { client } from "../api/client";
import { openAuthPopup } from "../event/auth";

export const auth = {
  login: () => {
    openAuthPopup(document.body);
  },
  logout: async () => {
    await client.POST("/identity/logout", {});
    window.location.href = "/";
  },
  getCurrentUser: async () => {
    const { data, error } = await client.GET("/identity/me", {});
    if (error) {
      return null;
    }
    return data;
  },
};
