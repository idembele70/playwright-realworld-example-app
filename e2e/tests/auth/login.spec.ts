import { expect, loginTest } from "./fixtures/login.fixture";

loginTest.describe('Authentication - Login', { tag: '@auth' }, () => {

  loginTest.describe('Happy path', { tag: '@happy-path' }, () => {
    loginTest('Login user with valid credentials', { tag: '@smoke'}, async ({ loginPage, user }) => {
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();
    });

    loginTest('User session persists after page refresh', async ({ loginPage, user, page }) => {
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();
      await page.reload();
      await expect(loginPage.header.profileLink).toBeVisible();
    });

    loginTest('Authenticated user cannot access login page', async ({ page, loginPage, user }) => {
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();
      await loginPage.goto();
      await expect(page).toHaveURL('/');
    });
  });

  loginTest.describe('Negative path', { tag: '@negative-path' }, () => {
    loginTest('Login fails with an error message when password is incorrect', async ({ loginPage, user }) => {
      await loginPage.login({ ...user, password: 'WRONG-_P@ssW0rd123?!' });
      await loginPage.expectLoginError();
    });

    loginTest('Login fails with an error message when email does not exist', async ({ loginPage, user }) => {
      await loginPage.login({ ...user, email: 'unexisting-email@invalid.invalid' });
      await loginPage.expectLoginError();
    });

    loginTest('Login fails with an error message when both email & password are incorrect', async ({ loginPage, user }) => {
      await loginPage.login({ ...user, email: 'invalid-email@invalid.invalid', password: 'Invalid-P@ss?!' });
      await loginPage.expectLoginError();
    });
  });

  loginTest.describe('Edge case', { tag: '@edge-case' }, () => {
    loginTest('User is logged out when authentication token is expired', async ({ loginPage, user, page }) => {
      loginTest.fixme(true, 'App crash when token is expired')
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();

      await page.goto('/')
      await expect(page).toHaveURL('/');

      await page.route('**/api/user', async route => {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'missing authorization credentials' }),
        });
      });

      await page.reload();

      await expect(loginPage.header.profileLink).toBeHidden();
    });

    loginTest('Multiple rapid login attempts do not trigger multiple authentication requests', async ({ loginPage, user, page }) => {
      let loginRequestCount = 0;
      await page.route('**/api/users/login', async route => {
        loginRequestCount++;
        await route.continue();
      });
      await loginPage.login({ ...user, password: 'Wr0ng-_P@ssw0rd!?' });
      await loginPage.submitButton.dblclick();

      expect.poll(() => loginRequestCount).toBe(1);
    });

    loginTest.use({ userOverrides: { password: 'P@ssw0rd?!' } });
    loginTest('Login successfully with special chars password', async ({ loginPage, user }) => {
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();
    });

    loginTest.use({ userOverrides: { password: ' password with spaces ' } });
    loginTest('Login successfully with spaces in password', async ({ loginPage, user }) => {
      await loginPage.login(user);
      await loginPage.expectLoginSuccess();
    });
  });
});
