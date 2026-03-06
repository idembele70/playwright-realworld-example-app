import { APIRequestContext, Page, request, TestInfo } from "@playwright/test";
import { User } from "./auth.model";
import { ENV, ENV_CONFIG } from "@config/env.config";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
import { AuthFactory } from "./auth.factory";

export class AuthUtility {
  static async createAccount(user: User): Promise<string | undefined> {
    const apiContext = await this.createAuthenticatedApiContext();

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
    const apiContext = await this.createAuthenticatedApiContext(token);

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
    const apiContext = await this.createAuthenticatedApiContext();

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
    try {
      const token = await this.login(user);
      return !!token;
    } catch {
      return false;
    }
  }

  static async createAuthenticatedApiContext(token?: string): Promise<APIRequestContext> {
    return await request.newContext({
      baseURL: ENV_CONFIG[ENV].baseURL.api,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
      },
    });
  }

  static async clearAuth(page: Page): Promise<void> {
    await page.evaluate(() => localStorage.clear());
  }

  static async setFakeToken(page: Page, token = 'invalid.fake.jwt.token'): Promise<void> {
    await page.evaluate((t) => localStorage.setItem('jwtToken', t), token);
  }

  static async createAuthToken(workerInfo: TestInfo): Promise<string> {
    const shardIndex = workerInfo.config.shard?.current ?? 1;
    const id = CompositeIdFactory.create('auth-fixture', 'shard', shardIndex, 'worker', workerInfo.parallelIndex);
    const user = AuthFactory.buildUser(id);
    return await AuthUtility.login(user);
  }
}