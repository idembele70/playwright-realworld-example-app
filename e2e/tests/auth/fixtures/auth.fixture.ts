import { AuthFactory } from '@auth/auth.factory';
import { AuthUtility } from '@auth/auth.utility';
import { ENV, ENV_CONFIG } from '@config/env.config';
import { test as baseTest } from '@playwright/test';
import { CompositeIdFactory } from '@shared/factories/composite-id.factory';
import fs from 'node:fs';
import path from 'node:path';

export const expect = baseTest.expect;

export const authTest = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [async ({} , use) => {
    const id = CompositeIdFactory.create('auth-fixture', authTest.info().parallelIndex);
    const fileDirectoryPath = path.join('playwright', '.auth');
    const fileName = path.resolve(fileDirectoryPath, `worker-${id}-user.json`);

    if (fs.existsSync(fileName)) {
      await use(fileName);
      return;
    }
    const user = AuthFactory.buildUser(id);
    const token = await AuthUtility.createAccount(user);

    const origin = new URL(ENV_CONFIG[ENV].baseURL.api).origin;

    const sessionStorage = {
      cookies: [],
      origins: [
        {
          origin,
          localStorage: [
            {
              name: "jwtToken",
              value: token,
            },
          ],
        },
      ],
    };

    fs.mkdirSync(fileDirectoryPath, { recursive: true })
    fs.writeFileSync(
      fileName,
      JSON.stringify(sessionStorage, null, 2),
      'utf-8',
    );

    await use(fileName);
  }, { scope: 'worker'}]
});