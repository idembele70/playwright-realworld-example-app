import { CreateArticleRequest } from "@article/models/article.model";
import { Locator, Page, TestInfo, expect } from "@playwright/test";
import { XssPayloadFactory } from "@shared/factories/xss-payload-factory";
import { HeaderComponent } from "@shared/layouts/header.component";
import { UiUtilities } from "@shared/utilities/ui-utilities";
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
    await this.page.goto(`${FRONT_URLS.ARTICLE_DETAILS}/${slug}`);
  }

  async expectArticleTitle(title: string | RegExp): Promise<void> {
    await expect(this.title).toHaveText(title);
  }

  async expectArticleVisible(articlePayload: CreateArticleRequest): Promise<void> {
    await this.expectArticleTitle(articlePayload.title);
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

  async expectNoXSS(testInfo: TestInfo): Promise<void> {
    const html = await this.container.innerHTML();
    for (const xssPayload of XssPayloadFactory.all(testInfo)) {
      expect(html).not.toContain(xssPayload);
    }
  }

  async expectEscapedContent(payload: string | string[]): Promise<void> {
    if (Array.isArray(payload)) {
      for (const currentPayload of payload) {
        await UiUtilities.expectEscapedContent(this.page, currentPayload);
      }
    } else
      await UiUtilities.expectEscapedContent(this.page, payload);
  }

  async expectSanitizedContent(payload: string): Promise<void> {
    await expect(this.container.getByText(payload)).toHaveCount(0);
  }
}