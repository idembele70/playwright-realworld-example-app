import { AuthFactory } from '@auth/auth.factory';
import { User } from '@auth/auth.model';
import { AuthUtility } from '@auth/auth.utility';
import { LoginPage } from '@auth/pages/login.page';
import { test as baseTest } from '@playwright/test';

export const loginTest = baseTest.extend<{ loginPage: LoginPage; existingUser: User; newUser: User; }>({
  existingUser: [async ({}, use, workerInfo) => {
    const id = AuthFactory.buildId('login-test-existing', workerInfo.parallelIndex);
    const user = AuthFactory.buildUser(id);
    const token = await AuthUtility.createAccount(user);
    await use(user);
    await AuthUtility.deleteAccount(token);
  }, { scope: 'test' }],
  newUser: [async ({}, use, workerInfo) => {
    const id = AuthFactory.buildId('login-test-new', workerInfo.parallelIndex);
    const user = AuthFactory.buildUser(id);
    await use(user);
  }, { scope: 'test' }],
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  }
});

export const expect = loginTest.expect;