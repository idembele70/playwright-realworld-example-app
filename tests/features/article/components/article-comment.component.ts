import { expect, Locator, Page } from "@playwright/test";

export class ArticleCommentComponent {
  private readonly articleCommentRowList: Locator;
  constructor(private readonly page: Page) {
    this.articleCommentRowList = this.page.locator('app-article-comment');
  }

  async expectVisible(comment: string): Promise<void> {
    await expect(this.articleCommentRowList.filter({
      has: this.page.locator('p', { hasText: comment }),
    })
    ).toBeVisible();
  }
}