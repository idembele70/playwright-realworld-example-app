import { expect, Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { User } from "./auth.model";

export class LoginPage {
  readonly urlRegExp = /login$/;
  readonly header: HeaderComponent;

  private readonly container: Locator;
  readonly signInHeader: Locator;
  readonly registerLink: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessages: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);

    this.container = this.page.locator('app-auth-page');
    this.signInHeader = this.container.getByRole('heading', { name: 'Sign in', exact: true });
    this.registerLink = this.container.getByRole('link', { name: 'Need an account?', exact: true });
    this.emailInput = this.container.getByPlaceholder('Email', { exact: true });
    this.passwordInput = this.container.getByPlaceholder('Password', { exact: true });
    this.submitButton = this.container.getByRole('button', { name: 'Sign in', exact: true });
    this.errorMessages = this.container.getByRole('list');
  }

  async goto(): Promise<void> {
    await this.page.goto('login');
  }

  async login(user: User): Promise<void> {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.submitButton.click();
  }

  async expectLoginSuccess(): Promise<void> {
    await expect(this.signInHeader).toBeHidden();
    await expect(this.page).not.toHaveURL(this.urlRegExp);
    await expect(this.header.profileLink).toBeVisible();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.signInHeader).toBeVisible();
    await expect(this.errorMessages).toHaveText('email or password is invalid');
    await expect(this.page).toHaveURL(this.urlRegExp);
    await expect(this.header.profileLink).toBeHidden();
  }
}