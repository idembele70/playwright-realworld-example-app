import { APIRequestContext, request } from "@playwright/test";
import { User } from "./auth.model";
import { ENV, ENV_CONFIG } from "@config/env.config";

export class AuthUtility {
  static async createAccount(user: User): Promise<string | undefined> {
    const apiContext = await this.createApiContext();

    const response = await apiContext.post('users', {
      data: { user },
    });

    if (!response.ok()) {
      throw new Error(`User creation failed: ${response.status()}`);
    }

    const token = (await response.json())?.user?.token;
    await apiContext.dispose();

    return token;
  }

  static async deleteAccount(token: string): Promise<void> {
    const apiContext = await this.createApiContext(token);

    const response = await apiContext.delete('user');

    if (!response.ok()) {
      throw new Error(`User deletion failed: ${response.status()}`);
    }

    await apiContext.dispose();
  }

  static async deleteUser(user: User): Promise<void> {
    const token = await AuthUtility.login(user);
    await AuthUtility.deleteAccount(token);
  }

  static async login(user: User): Promise<string> {
    const apiContext = await this.createApiContext();

    const response = await apiContext.post('users/login', {
      data: { user },
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    const token = (await response.json())?.user?.token;
    await apiContext.dispose();

    return token;
  }

  static async doesUserExists(user: User): Promise<boolean> {
    const token = await this.login(user);
    return !!token;
  }

  private static async createApiContext(token?: string): Promise<APIRequestContext> {
    return await request.newContext({
      baseURL: ENV_CONFIG[ENV].baseURL.api,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
      },
    });
  }
}