import { CreateArticleRequest } from "@article/models/article.model";
import { expect } from "@auth/fixtures/auth.fixture";
import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS, FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";

export class ArticleDetailsPage {
  readonly urlRegExp = FRONT_URLS_REG_EXP.ARTICLE_DETAILS;
  readonly header: HeaderComponent;

  private readonly container: Locator;

  readonly bannerWrapper: Locator;
  readonly title: Locator;
  readonly bannerDeleteArticleButton: Locator;

  readonly content: Locator;
  readonly tagList: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(this.page);

    this.container = this.page.locator('app-article-page');

    this.bannerWrapper = this.container.locator('.banner');
    this.title = this.bannerWrapper.getByRole('heading');
    this.bannerDeleteArticleButton = this.bannerWrapper.getByRole('button', { name: 'Delete Article' });

    this.content = this.container.locator('.article-content');
    this.tagList = this.container.locator('ul.tag-list');
  }

  async goToViaUrl(slug: string): Promise<void> {
    await this.page.goto(`${FRONT_URLS.ARTICLE_DETAILS}/${slug}`)
  }

  async expectArticleVisible(articlePayload: CreateArticleRequest): Promise<void> {
    await expect(this.title).toHaveText(articlePayload.title);
    await expect(this.content).toContainText(articlePayload.body);
    for (const tag of articlePayload.tagList) {
      await expect(this.tagList).toContainText(tag);
    }
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