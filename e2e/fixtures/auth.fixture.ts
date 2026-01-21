import { AuthFixtureUtility } from '@utilities/auth-fixture.utility';
import { test as baseTest } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const expect = baseTest.expect;

export const authTest = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [async ({} , use) => {
    const id = authTest.info().parallelIndex;
    const fileDirectoryPath = path.join('playwright', '.auth')
    const fileName = path.resolve(fileDirectoryPath, `worker-${id}-user.json`);

    if (fs.existsSync(fileName)) {
      await use(fileName);
      return;
    }
    const token = await AuthFixtureUtility.createAccount(id);

    const sessionStorage = {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:4200",
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