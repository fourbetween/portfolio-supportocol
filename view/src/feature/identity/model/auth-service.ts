import { client } from "../api/client";
import { IdentityAuthPopupOpenEvent } from "../event/auth";
import type { User } from "./user";

/**
 * 認証状態を管理するサービス
 */
class AuthService {
  private _user?: User;
  private _initialized = false;
  private _fetchingPromise?: Promise<User | undefined>;

  /**
   * ログイン画面のポップアップを表示します。
   */
  login(): void {
    document.body.dispatchEvent(new IdentityAuthPopupOpenEvent());
  }

  /**
   * ログアウト処理を行い、トップページへ遷移します。
   */
  async logout(): Promise<void> {
    try {
      await client.POST("/v1/identity/logout", {});
    } catch (e) {
      console.warn("Logout API call failed, proceeding with local logout", e);
    } finally {
      this._user = undefined;
      this._initialized = false;
      window.location.href = "/";
    }
  }

  /**
   * アカウントを削除（退会）し、トップページへ遷移します。
   */
  async deleteAccount(): Promise<void> {
    const { error } = await client.DELETE("/v1/identity/me", {});
    if (error) {
      throw new Error(error.message);
    }
    this._user = undefined;
    this._initialized = false;
    window.location.href = "/";
  }

  /**
   * 認証が必要な操作を行う前に呼び出します。
   * 未認証の場合はログイン画面を表示します。
   */
  async requireAuth(): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) {
      this.login();
      return false;
    }
    return true;
  }

  /**
   * 現在のユーザーを取得します。
   * すでに取得済みの場合はキャッシュを返し、そうでない場合はAPIを呼び出します。
   *
   * @param force - キャッシュを無視して強制的に再取得するかどうか
   */
  async getCurrentUser(force = false): Promise<User | undefined> {
    if (this._initialized && !force) {
      return this._user;
    }

    if (this._fetchingPromise) {
      return this._fetchingPromise;
    }

    this._fetchingPromise = this.fetchUser();
    return this._fetchingPromise;
  }

  private async fetchUser(): Promise<User | undefined> {
    try {
      const { data, error } = await client.GET("/v1/identity/me", {});
      if (error) {
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
      this._user = data;
      return this._user;
    } catch (e) {
      console.error("Failed to fetch user:", e);
      this._user = undefined;
      return undefined;
    } finally {
      this._initialized = true;
      this._fetchingPromise = undefined;
    }
  }
}

export const authService = new AuthService();
