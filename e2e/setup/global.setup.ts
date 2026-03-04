import { AuthFactory } from "@auth/auth.factory";
import { AuthUtility } from "@auth/auth.utility";
import { ENV, ENV_CONFIG } from "@config/env.config";
import { FullConfig } from "@playwright/test";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
import fs from "node:fs";
import path from "node:path";

export default async function globalSetup(config: FullConfig) {
  const workers = config.workers ?? 1;
  console.log(`[globalSetup] Starting setup for ${workers} workers`);

  const authDir = path.join('playwright', '.auth');
  fs.mkdirSync(authDir, { recursive: true })

  const tasks = Array.from({ length: workers }, async (_, workerIndex) => {
    const id = CompositeIdFactory.create('auth-fixture', workerIndex);
    const storageFile = path.resolve(authDir, `worker-${id}-user.json`);
    if (fs.existsSync(storageFile)) {
      console.log(`[globalSetup] auth already exists for worker ${workerIndex}`);
      return;
    }
    const user = AuthFactory.buildUser(id);
    const token = await AuthUtility.createAccount(user);

    const sessionStorage = {
      cookies: [],
      origins: [
        {
          origin: new URL(ENV_CONFIG[ENV].baseURL.front).origin,
          localStorage: [
            {
              name: "jwtToken",
              value: token,
            },
          ],
        },
      ],
    };
    fs.writeFileSync(
      storageFile,
      JSON.stringify(sessionStorage, null, 2),
      'utf-8',
    );
    console.log(`[globalSetup] auth created for worker ${workerIndex}`);
  });

  await Promise.all(tasks);
  console.log("[globalSetup] authentication setup completed");
}