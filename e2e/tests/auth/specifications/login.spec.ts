import { FRONT_URLS } from "@shared/utilities/url-front.utility";
import { expect, loginTest } from "../fixtures/login.fixture";
import { AuthUtility } from "@auth/auth.utility";

loginTest.describe('Authentication - Login', { tag: '@auth' }, () => {

  loginTest.describe('Happy', { tag: '@happy' }, () => {

    loginTest('Login existing user with valid credentials', { tag: '@smoke' }, async ({ loginPage, existingUser }) => {
      await loginPage.login(existingUser);
      await loginPage.expectLoginSuccess();
    });

    loginTest('existingUser session persists after page refresh', async ({ loginPage, existingUser, page }) => {
      await loginPage.login(existingUser);
      await loginPage.expectLoginSuccess();
      await page.reload();
      await expect(loginPage.header.profileLink).toBeVisible();
    });

    loginTest('Authenticated existing user cannot access login page', async ({ page, loginPage, existingUser }) => {
      await loginPage.login(existingUser);
      await loginPage.expectLoginSuccess();
      await loginPage.goto();
      await expect(page).toHaveURL(FRONT_URLS.HOME);
    });
  });

  loginTest.describe('Negative', { tag: '@negative' }, () => {

    loginTest('Login fails with an error message when password is incorrect', async ({ loginPage, existingUser }) => {
      await loginPage.login({ ...existingUser, password: 'WRONG-_P@ssW0rd123?!' });
      await loginPage.expectLoginError();
    });

    loginTest('Login fails with an error message when email does not exist', async ({ loginPage, existingUser }) => {
      await loginPage.login({ ...existingUser, email: 'unexisting-email@invalid.invalid' });
      await loginPage.expectLoginError();
    });

    loginTest('Login fails with an error message when both email & password are incorrect', async ({ loginPage, existingUser }) => {
      await loginPage.login({ ...existingUser, email: 'invalid-email@invalid.invalid', password: 'Invalid-P@ss?!' });
      await loginPage.expectLoginError();
    });
  });

  loginTest.describe('Edge', { tag: '@edge' }, () => {
    loginTest('existing user is logged out when authentication token is expired', async ({ loginPage, existingUser, page }) => {
      loginTest.fixme(true, 'App crash when token is expired')
      await loginPage.login(existingUser);
      await loginPage.expectLoginSuccess();

      await page.goto('/')
      await expect(page).toHaveURL(FRONT_URLS.HOME);

      await page.route('**/api/user', async route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'missing authorization credentials' }),
        });
      });

      await page.reload();

      await expect(loginPage.header.profileLink).toBeHidden();
      await AuthUtility.deleteUser(existingUser);
    });

    loginTest('Multiple rapid login attempts do not trigger multiple authentication requests', async ({ loginPage, existingUser, page }) => {
      let loginRequestCount = 0;
      await page.route('**/api/users/login', async route => {
        loginRequestCount++;
        await route.continue();
      });
      await loginPage.login({ ...existingUser, password: 'Wr0ng-_P@ssw0rd!?' });
      await loginPage.submitButton.dblclick({ force: true });

      await expect.poll(() => loginRequestCount).toBe(1);
    });

    loginTest('Login successfully with special chars password', async ({ loginPage, newUser }) => {
      const user = { ...newUser, password: 'P@ssw0rd?!' };
      try {
        await AuthUtility.createAccount(user);
        await loginPage.login(user);
        await loginPage.expectLoginSuccess();
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });
    
    loginTest('Login successfully with spaces in password', async ({ loginPage, newUser }) => {
      const user = { ...newUser, password: ' password with spaces ' };
      try {
        await AuthUtility.createAccount(user);
        await loginPage.login(user);
        await loginPage.expectLoginSuccess();
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });
  });
});
