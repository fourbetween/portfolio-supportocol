import { client } from "../api/client";
import { AuthPopupOpenEvent } from "../event/auth";
import type { User } from "./user";

class AuthService {
  private _user: User | null = null;
  private _initialized = false;

  async getCurrentUser(force = false) {
    if (!this._initialized || force) {
      try {
        const { data, error } = await client.GET("/identity/me", {});
        if (!error) {
          this._user = data;
        }
      } finally {
        this._initialized = true;
      }
    }
    return this._user;
  }

  login() {
    document.body.dispatchEvent(new AuthPopupOpenEvent());
  }

  async logout() {
    await client.POST("/identity/logout", {});
    this._user = null;
    window.location.href = "/";
  }
}

export const authService = new AuthService();
