import { Article } from "@article/models/article.model";
import { expect, Locator, Page } from "@playwright/test";
import { DateUtilities } from "@shared/utilities/date.utilities";
import { FRONT_URLS, FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";

export class ArticlePreviewComponent {
  private readonly articlePreviewRowList: Locator;
  constructor(private readonly page: Page) {
    this.articlePreviewRowList = this.page.locator('app-article-preview');
  }

  async expectVisible(article: Article): Promise<void> {
    const { author } = article;
    const articlePreviewRow = this.getCurrentArticlePreviewRow(article.title);
    await expect(articlePreviewRow.getByRole('img')).toHaveAttribute('src', author.image);
    await expect(articlePreviewRow.getByRole('link', { name: author.username })).toHaveAttribute('href', new RegExp(`${FRONT_URLS.PROFILE}/${author.username}`),);
    await expect(articlePreviewRow.locator('.date', { hasText: DateUtilities.formatDateToLongEnglish(article.createdAt) })).toBeVisible();
    await expect(articlePreviewRow.getByRole('heading', { name: article.title })).toBeVisible();
    await expect(articlePreviewRow.locator('p', { hasText: article.description })).toBeVisible();
    await expect(articlePreviewRow.getByText('Read more...')).toBeVisible();
    await expect(articlePreviewRow.getByRole('listitem')).toHaveText(article.tagList);
  }

  async toHaveCount(count: number): Promise<void> {
    await expect(this.articlePreviewRowList).toHaveCount(count);
  }


  async getSlug(title: string): Promise<null | string> {
    if (FRONT_URLS_REG_EXP.HOME.test(this.page.url()) === false) {
      return null;
    }
    const articlePreviewRow = this.getCurrentArticlePreviewRow(title);
    const link = await articlePreviewRow.locator('.preview-link').getAttribute('href');
    return link.split('/').at(-1);
  }

  getCurrentArticlePreviewRow(title: string): Locator {
    return this.articlePreviewRowList.filter({
      has: this.page.getByRole('heading', { name: title, exact: true }),
    });
  }
}