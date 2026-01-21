import { authTest, expect } from '../fixtures/auth.fixture';
authTest.use({ headless: false })
authTest('has title', async ({ page }) => {
  await page.goto('');
  await page.pause();
});