import { User } from "@auth/auth.model";
import { AuthUtility } from "@auth/auth.utility";
import { expect } from "@auth/fixtures/register.fixture";
import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS } from "@shared/utilities/url-front.utility";

export class RegisterPage {
  readonly urlRegExp = FRONT_URLS.REGISTER;
  readonly header: HeaderComponent;

  private readonly container: Locator;
  readonly signUpHeader: Locator;
  readonly loginLink: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);

    this.container = this.page.locator('app-auth-page');
    this.signUpHeader = this.container.getByRole('heading', { name: 'Sign up', exact: true });
    this.loginLink = this.container.getByRole('link', { name: 'Have an account?', exact: true });
    this.usernameInput = this.container.getByPlaceholder('Username', { exact: true });
    this.emailInput = this.container.getByPlaceholder('Email', { exact: true });
    this.passwordInput = this.container.getByPlaceholder('Password', { exact: true });
    this.submitButton = this.container.getByRole('button', { name: 'Sign up', exact: true });
    this.errorMessages = this.container.getByRole('listitem');
  }

  async goto(): Promise<void> {
    await this.page.goto('register');
  }

  async fillForm(user: User): Promise<void> {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
  }

  async register(user: User): Promise<void> {
    await this.fillForm(user);
    await this.submitButton.click();
  }

  async expectRegisterSuccess(): Promise<void> {
    await expect(this.signUpHeader).toBeHidden();
    await expect(this.page).not.toHaveURL(this.urlRegExp);
    await expect(this.header.profileLink).toBeVisible();
  }

  async expectRegisterError(errorMessages: string[]): Promise<void> {
    await expect(this.signUpHeader).toBeVisible();
    await expect(this.errorMessages).toHaveText(errorMessages);
    await expect(this.page).toHaveURL(this.urlRegExp);
    await expect(this.header.profileLink).toBeHidden();
  }

  async expectSubmitBtnDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.submitButton).toHaveCSS('cursor', 'not-allowed');
    await expect(this.submitButton).toHaveCSS('opacity', '0.65');
  }

  async expectPageToBeProtectedForAuthenticatedUsers(): Promise<void> {
    await expect(this.page).toHaveURL(FRONT_URLS.HOME);
    await expect(this.header.signInLink).toBeHidden();
    await expect(this.header.signUpLink).toBeHidden();
  }

  async expectUserToBeRegisteredButNotAuthenticated(user: User): Promise<void> {
    await expect(this.page).toHaveURL(this.urlRegExp);

    const userExists = await AuthUtility.doesUserExists(user);
    expect(userExists).toBeTruthy();
  }
}