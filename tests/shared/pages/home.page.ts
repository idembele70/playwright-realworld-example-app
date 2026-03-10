import { ArticlePreviewComponent } from "@article/components/article-preview.component";
import { expect, Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS, FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";

export class HomePage {
  header: HeaderComponent;
  readonly mainContent: Locator;
  readonly articlePreview: ArticlePreviewComponent;
  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(this.page);
    this.mainContent = this.page.locator('app-home-page')
    this.articlePreview = new ArticlePreviewComponent(this.page);
  }

  async goToViaUrl(): Promise<void> {
    await this.page.goto(FRONT_URLS.HOME);
  }

  getPaginationButton(pageNumber: number): Locator {
    return this.page.locator('button.page-link', { hasText: String(pageNumber) });
  }

  async selectTag(tag: string): Promise<void> {
    await this.page.locator('a.tag-pill', { hasText: tag }).click();
  }

  async expectTagFilterTitle(tag: string): Promise<void> {
    await expect(this.page.locator('.nav-item', { hasText: tag })).toBeVisible();
  }

  async expectOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL(FRONT_URLS_REG_EXP.HOME);
    await expect(this.mainContent).toBeVisible();
  }

  async expectOnAuthenticatedHomePage(): Promise<void> {
    await this.expectOnHomePage();
    await this.header.expectAuthenticatedHeaderVisible();
  }

  async expectEmptyState(): Promise<void> {
    await expect(this.page.locator('.article-preview')).toHaveText('No articles are here... yet.');
    await expect(this.page.getByText('No tags are here... yet.')).toBeVisible();
  }

  async expectLoadingIndicatorVisible(): Promise<void> {
    await expect(this.page.getByText('Loading articles...')).toBeVisible();
  }
}