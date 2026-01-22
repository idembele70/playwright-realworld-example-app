import { request } from "@playwright/test";
import { User } from "./auth.model";

export class AuthUtility {
  static async createAccount(user: User): Promise<string | undefined> {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api/',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

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
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api/',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
    });

    const response = await apiContext.delete('user');

    if (!response.ok()) {
      throw new Error(`User deletion failed: ${response.status()}`);
    }

    await apiContext.dispose();
  }
}