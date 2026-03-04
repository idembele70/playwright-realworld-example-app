import { expect } from "@auth/fixtures/auth.fixture";
import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";
import { Article } from "article/models/article.model";

export class ArticleDetailsPage {
  readonly urlRegExp = FRONT_URLS_REG_EXP.ARTICLE_DETAILS;
  readonly header: HeaderComponent;

  private readonly container: Locator;

  readonly bannerWrapper: Locator;
  readonly title: Locator;
  readonly bannerDeleteArticleButton: Locator;

  readonly content: Locator;
  readonly tagItems: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(this.page);

    this.container = this.page.locator('app-article-page');

    this.bannerWrapper = this.container.locator('.banner');
    this.title = this.bannerWrapper.getByRole('heading');
    this.bannerDeleteArticleButton = this.bannerWrapper.getByRole('button', { name: 'Delete Article' });

    this.content = this.container.locator('.article-content');
    this.tagItems = this.container.getByRole('listitem');
  }

  async expectArticleVisible(article: Article): Promise<void> {
    await expect(this.title).toHaveText(article.title);
    await expect(this.content).toContainText(article.content);
    await expect(this.tagItems).toHaveText(article.tags);
  }

  async deleteArticleFromBanner(): Promise<void> {
    await this.bannerDeleteArticleButton.click();
  }

  getSlugFromUrl(): string | undefined {
    const url = this.page.url();
    if (url.includes('article')) {
      return url.split('/').at(-1);
    }
    return undefined;
  }

  async expectNoInjectedScript(): Promise<void> {
    await expect(
      this.container.locator('script')
    ).toHaveCount(0);
  }

  async expectEscapedContent(payload: string): Promise<void> {
    await expect(
      this.page.getByText(payload)
    ).toBeVisible();
  }
}