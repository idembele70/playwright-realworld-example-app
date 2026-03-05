import { test as baseTest } from '@playwright/test';
import { CompositeIdFactory } from '@shared/factories/composite-id.factory';
import fs from 'node:fs';
import path from 'node:path';

export const expect = baseTest.expect;

export const authTest = baseTest.extend<{}, { workerStorageState: string }>({
  storageState: ({ workerStorageState }, use) => use(workerStorageState),
  workerStorageState: [async ({ }, use, workerInfo) => {
    const { parallelIndex } = workerInfo;
    const shardIndex = workerInfo.config.shard?.current ?? 1;
    const id = CompositeIdFactory.create('auth-fixture', 'shard', shardIndex, 'worker', parallelIndex);
    const fileDirectoryPath = path.join('playwright', '.auth');
    const fileName = path.resolve(fileDirectoryPath, `${id}-user.json`);

    if (!fs.existsSync(fileName)) {
      throw new Error(`Auth file not found: ${fileName}`);
    }
    await use(fileName);
  }, { scope: 'worker' }]
});