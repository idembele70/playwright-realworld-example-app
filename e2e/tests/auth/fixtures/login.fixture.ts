import { AuthFactory } from '@auth/auth.factory';
import { User } from '@auth/auth.model';
import { AuthUtility } from '@auth/auth.utility';
import { LoginPage } from '@auth/login.page';
import { test as baseTest } from '@playwright/test';

export const loginTest = baseTest.extend<{ loginPage: LoginPage; userOverrides?: Partial<User>; user: User }>({
  userOverrides: [undefined, { scope: 'test'}],
  user: [async ({ userOverrides }, use, workerInfo) => {
    const id = AuthFactory.buildId('login-test', workerInfo.parallelIndex);
    const baseUser = AuthFactory.buildUser(id);
    const user = { ...baseUser, ...userOverrides };
    const token = await AuthUtility.createAccount(user);
    await use(user);
    await AuthUtility.deleteAccount(token);
  }, { scope: 'test' }],
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  }
});
export const expect = loginTest.expect;