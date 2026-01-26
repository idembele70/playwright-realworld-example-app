import { Locator, Page } from "@playwright/test";

export class HeaderComponent {
  private readonly container: Locator;
  readonly brandLink: Locator;
  readonly homeLink: Locator;
  readonly newArticleLink: Locator;
  readonly settingsLink: Locator;
  readonly profileLink: Locator;
  readonly signInLink: Locator;
  readonly signUpLink: Locator;

  constructor(private readonly page: Page) {
    this.container = this.page.getByRole('navigation');

    this.brandLink = this.container.getByRole('link', { name: 'conduit', exact: true });
    this.homeLink = this.container.getByRole('link', { name: 'Home', exact: true});
    this.newArticleLink = this.container.getByRole('link', { name: /New Article$/});
    this.settingsLink = this.container.getByRole('link', { name: /Settings$/});
    this.profileLink = this.container.getByRole('link').filter({ has: this.page.getByRole('img')});

    this.signInLink = this.container.getByRole('link', { name: 'Sign in', exact: true});
    this.signUpLink = this.container.getByRole('link', { name: 'Sign up', exact: true});
  }

  async goToProfile(): Promise<void> {
    await this.profileLink.click();
  }
}