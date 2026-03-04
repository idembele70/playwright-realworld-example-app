import { AuthUtility } from "@auth/auth.utility";
import { Page } from "@playwright/test";
import { API_URLS, mockApiUrl } from "@shared/utilities/url-api.utility";

export class ArticleUtility {
  static async deleteArticle(token: string, slug: string): Promise<void> {
    const apiContext = await AuthUtility.createAuthenticatedApiContext(token);

    const response = await apiContext.delete(API_URLS.ARTICLES.DELETION(slug));

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Delete article failed: ${response.status()} ${response.statusText()} - ${body}`
      );
    }
    await apiContext.dispose();
  }

  static async deleteArticleIfCreated(token: string, slug?: string): Promise<void> {
    if (slug)
      await this.deleteArticle(token, slug);
  }

  static async mockCreateArticle(page: Page, { delay = 0, status = 201, body = {} } = {}): Promise<{
    getCallCount: () => number,
  }> {
    let callCount = 0;
    await page.route(mockApiUrl(API_URLS.ARTICLES.CREATION), async route => {
      callCount++;

      if (delay) await new Promise(r => setTimeout(r, delay));

      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });

    return {
      getCallCount: () => callCount,
    }
  }
}