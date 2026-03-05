import { AuthFactory } from '@auth/auth.factory';
import { User } from '@auth/auth.model';
import { RegisterPage } from '@auth/pages/register.page';
import { test as baseTest } from '@playwright/test';
import { CompositeIdFactory } from '@shared/factories/composite-id.factory';

export const registerTest = baseTest.extend<{
  registerPage: RegisterPage;
  user: User;
}>({
  user: [async ({}, use, workerInfo) => {
    const shardIndex = workerInfo.config.shard?.current ?? 1;
    const id = CompositeIdFactory.create('register-test', 'shard', shardIndex, 'worker', workerInfo.parallelIndex);
    const user = AuthFactory.buildUser(id);
    await use(user);
  }, { scope: 'test' }],
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await use(registerPage);
  }
});

export const expect = registerTest.expect;