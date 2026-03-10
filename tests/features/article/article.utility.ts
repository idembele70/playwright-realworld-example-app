import { AuthUtility } from "@auth/auth.utility";
import { Page } from "@playwright/test";
import { API_URLS, mockApiUrl } from "@shared/utilities/url-api.utility";
import { Article, CreateArticleRequest } from "./models/article.model";

export class ArticleUtility {
  static async createArticleViaApi(token: string, articlePayload: CreateArticleRequest): Promise<Article> {
    const apiContext = await AuthUtility.createAuthenticatedApiContext(token);

    try {
      const response = await apiContext.post(API_URLS.ARTICLES.SAVE(), {
        data: { article: articlePayload },
      });

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(
          `Create article failed: ${response.status()} ${response.statusText()} - ${body}`
        );
      }
      const responseBody = await response.json();
      return responseBody.article;
    } finally {
      await apiContext.dispose();
    }
  }

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

  static async mockArticleSave(page: Page, { delay = 0, status = 201, body = {}, slug = '' } = {}): Promise<{
    getCallCount: () => number,
  }> {
    let callCount = 0;
    await page.route(mockApiUrl(API_URLS.ARTICLES.SAVE(slug)), async route => {
        callCount++;

      if (delay) await new Promise(r => setTimeout(r, delay));

      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    },);

    return {
      getCallCount: () => callCount,
    }
  }

  static async mockGetArticleList(page: Page, { delay = 0, status = 200, body = {} } = {}): Promise<void> {
    await page.route(mockApiUrl(API_URLS.ARTICLES.GET_LIST()), async route => {
      if (delay) await new Promise(r => setTimeout(r, delay));
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

  static async mockGetTagList(page: Page, { delay = 0, status = 200, body = {} } = {}): Promise<void> {
    await page.route(mockApiUrl(API_URLS.TAG.GET_LIST), async route => {
      if (delay) await new Promise(r => setTimeout(r, delay));
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

}