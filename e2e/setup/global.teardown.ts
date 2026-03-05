import { AuthFactory } from "@auth/auth.factory";
import { AuthUtility } from "@auth/auth.utility";
import { FullConfig } from "@playwright/test";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
import path from "node:path";
import fs from "node:fs";

export default async function globalTeardown(config: FullConfig) {
  const workers = config.workers ?? 1;

  const shardIndex = config.shard?.current ?? 1;
  const shardTotal = config.shard?.total ?? 1;

  console.log(
    `[globalTeardown] Starting teardown for ${shardIndex}/${shardTotal} with ${workers} workers`
  );

  const deletions = Array.from({ length: workers }, async (__dirname, workerIndex) => {
    try {
    const id = CompositeIdFactory.create('auth-fixture', 'shard', shardIndex, 'worker', workerIndex);
      const user = AuthFactory.buildUser(id);
      const token = await AuthUtility.login(user);
      await AuthUtility.deleteAccount(token);
      console.log(
        `[globalTeardown] deleted account for shard ${shardIndex} worker ${workerIndex}`
      );
    } catch (error) {
      console.error(
        `[globalTeardown] failed to delete account for shard ${shardIndex} worker ${workerIndex}`,
        error,
      );
    }
  });

  await Promise.all(deletions);

  const authDir = path.join('playwright', '.auth');
  fs.rmSync(authDir, { recursive: true, force: true });

  console.log("[globalTeardown] auth directory removed");
  console.log("[globalTeardown] teardown completed");
};
