import { request } from "@playwright/test";

export class AuthFixtureUtility {
  static async createAccount(id: number): Promise<string | undefined> {
    const apiContext = await request.newContext({
      baseURL: 'http://localhost:3000/api/',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });

    const response = await apiContext.post('users', {
      data: {
        user: {
          email: `user-${id}@invalid.invalid`,
          username: `user-${id}`,
          password: 'P@ssw0rd!?',
        },
      },
    });

    if (!response.ok()) {
      throw new Error(`User creation failed: ${response.status()}`);
    }

    const token = (await response.json())?.user?.token;
    await apiContext.dispose();

    return token;
  }
}