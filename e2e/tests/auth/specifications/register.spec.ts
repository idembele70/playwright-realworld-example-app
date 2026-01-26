import { AuthUtility } from "@auth/auth.utility";
import { registerTest } from "@auth/fixtures/register.fixture";

registerTest.describe('Authentication - Register', { tag: '@auth' }, () => {

  registerTest.describe('Happy', { tag: '@happy' }, () => {
    registerTest.afterEach(async ({ user }) => {
      await AuthUtility.deleteUser(user);
    });

    registerTest('Register with valid credentials should authenticate user', { tag: '@smoke' }, async ({ registerPage, user }) => {
      await registerPage.register(user);
      await registerPage.expectRegisterSuccess();
    });
  });

  registerTest.describe('Negative', { tag: '@negative' }, () => {
    registerTest('Register fails with existing username', async ({ registerPage, user }) => {
      try {
        await AuthUtility.createAccount(user);
        await registerPage.register({ ...user, email: 'unexisting-email@invalid.invalid' });
        await registerPage.expectRegisterError(['username has already been taken']);
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });

    registerTest('Register fails with existing email', async ({ registerPage, user }) => {
      try {
        await AuthUtility.createAccount(user);
        await registerPage.register({ ...user, username: 'unexisting-username' });
        await registerPage.expectRegisterError(['email has already been taken']);
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });

    registerTest('Register fails with existing username & email', async ({ registerPage, user }) => {
      try {
        await AuthUtility.createAccount(user);
        await registerPage.register(user);
        await registerPage.expectRegisterError(['email has already been taken', 'username has already been taken']);
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });

    registerTest('Attempt to register without username', async ({ registerPage, user }) => {
      await registerPage.fillForm({ ...user, username: '' });
      await registerPage.expectSubmitBtnDisabled();
    });

    registerTest('Attempt to register without email', async ({ registerPage, user }) => {
      await registerPage.fillForm({ ...user, email: '' });
      await registerPage.expectSubmitBtnDisabled();
    });

    registerTest('Attempt to register without password', async ({ registerPage, user }) => {
      await registerPage.fillForm({ ...user, password: '' });
      await registerPage.expectSubmitBtnDisabled();
    });

    registerTest('Authenticated user cannot access register page', async ({ registerPage, user }) => {
      try {
        await registerPage.register(user);
        await registerPage.expectRegisterSuccess();
        await registerPage.goto();
        await registerPage.expectPageToBeProtectedForAuthenticatedUsers();
      } finally {
        await AuthUtility.deleteUser(user);
      }
    });
  });

  registerTest.describe('Edge', { tag: '@edge' }, () => {
    registerTest.afterEach(async ({ user }) => {
      await Promise.allSettled([
        AuthUtility.deleteUser(user),
        AuthUtility.deleteUser({ ...user, username: ` ${user.username}` }),
        AuthUtility.deleteUser({ ...user, email: ` ${user.email}` }),
        AuthUtility.deleteUser({ ...user, password: ` ${user.password}` }),
      ]);
    });

    registerTest('Register with leading space in the username', async ({ registerPage, user }) => {
      await registerPage.register({ ...user, username: ` ${user.username}` });
      await registerPage.expectRegisterSuccess();
    });

    registerTest('Register with leading space in the email', async ({ registerPage, user }) => {
      await registerPage.register({ ...user, email: ` ${user.email}` });
      await registerPage.expectRegisterSuccess();
    });

    registerTest('Register with leading space in the password', async ({ registerPage, user }) => {
      await registerPage.register({ ...user, password: ` ${user.password}` });
      await registerPage.expectRegisterSuccess();
    });
  });
});