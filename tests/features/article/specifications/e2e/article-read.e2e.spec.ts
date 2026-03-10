import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { articleReadTest, expect } from "@article/fixtures/article-read.fixture";
import { Article } from "@article/models/article.model";

articleReadTest.describe('Article - Read', { tag: ['@article', '@e2e'] }, () => {
  articleReadTest.describe('Happy', { tag: '@Happy' }, () => {
    articleReadTest('Display article list', { tag: '@smoke' },
      async ({ articlePayload, token, homePage }) => {
        let article: Article | undefined;
        try {
          article = await ArticleUtility.createArticleViaApi(token, articlePayload);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(article)
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article?.slug);
        }
      }
    );
    articleReadTest('Paginate article list when articles exceed page size', { tag: '@regression' },
      async ({ token, homePage }, workerInfo) => {
        let articleList: Article[] = [];
        try {
          const articlePayloadList = Array.from({ length: 12 }).map((_, i) =>
            ArticleFactory.generateTestArticle(workerInfo, `pagination-${i}`)
          );
          articleList = await Promise.all(
            articlePayloadList.map(payload =>
              ArticleUtility.createArticleViaApi(token, payload)
            )
          );
          await homePage.goToViaUrl();
          await expect(homePage.getPaginationButton(1)).toBeVisible();
          const pageTwoButton = homePage.getPaginationButton(2);
          await pageTwoButton.click();
          await expect(pageTwoButton.locator('..')).toHaveClass(/active/);
        } finally {
          await Promise.all(
            articleList.map(({ slug }) => ArticleUtility.deleteArticleIfCreated(token, slug))
          )
        }
      }
    );
    articleReadTest('Filter article by selected tag', { tag: '@regression' },
      async ({ token, homePage }, workerInfo) => {
        let taggedArticle: Article | undefined;
        let otherArticle: Article | undefined;

        try {
          const tagToSelect = 'playwright'
          const taggedPayload = ArticleFactory.generateTestArticle(workerInfo, 'tag-test');
          taggedPayload.tagList = [tagToSelect];

          const otherPayload = ArticleFactory.generateTestArticle(workerInfo, 'other-tag-test');
          otherPayload.tagList = ['typescript'];

          [taggedArticle, otherArticle] = await Promise.all([
            ArticleUtility.createArticleViaApi(token, taggedPayload),
            ArticleUtility.createArticleViaApi(token, otherPayload)
          ])

          await homePage.goToViaUrl();
          await homePage.selectTag(tagToSelect);
          await homePage.articlePreview.expectVisible(taggedArticle);
          await homePage.articlePreview.toHaveCount(1);
          await homePage.expectTagFilterTitle(tagToSelect);
        } finally {
          await Promise.all([
            ArticleUtility.deleteArticleIfCreated(token, taggedArticle?.slug),
            ArticleUtility.deleteArticleIfCreated(token, otherArticle?.slug),
          ]);
        }
      }
    );
  });

  articleReadTest.describe('Negative', { tag: '@negative' }, () => {
    articleReadTest('Redirect to homepage when navigating to nonexistent article', { tag: '@regression' },
      async ({ articleDetailsPage, homePage }) => {
        const fakeSlug = 'article-does-not-exist-123456';

        await articleDetailsPage.goToViaUrl(fakeSlug);
        await homePage.expectOnAuthenticatedHomePage()
      }
    );
    articleReadTest('Redirect to homepage when navigating to deleted article', { tag: '@regression' },
      async ({ articleDetailsPage, token, articlePayload, homePage }) => {
        let article: Article | undefined;
        article = await ArticleUtility.createArticleViaApi(token, articlePayload);
        await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        await articleDetailsPage.goToViaUrl(article.slug);
        await homePage.expectOnAuthenticatedHomePage()
      }
    );
    articleReadTest('Show error message when article API fails', { tag: '@regression' },
      async ({ page, homePage, token, articlePayload }) => {
        articleReadTest.fixme(true, 'BUG: when API returns 500, the loader stays visible indefinitely instead of showing an error message');
        let article: Article | undefined;
        try {
          article = await ArticleUtility.createArticleViaApi(token, articlePayload);

          await ArticleUtility.mockGetArticleList(page, {
            status: 500,
            body: { error: 'Internal server error' },
          })
          await homePage.goToViaUrl();
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article?.slug);
        }
      }
    );
  });

  articleReadTest.describe('Edge', { tag: '@edge' }, () => {
    articleReadTest(
      'Show empty state when no articles exist',
      { tag: ['@regression'] },
      async ({ page, homePage }) => {
        await ArticleUtility.mockGetArticleList(page,
          {
            status: 200,
            body: {
              articles: [],
              articlesCount: 0,
            },
          }
        );
        await ArticleUtility.mockGetTagList(page,
          {
            status: 200,
            body: { tags: [] },
          }
        );
        await homePage.goToViaUrl();
        await homePage.expectEmptyState();
      }
    );
    articleReadTest(
      'Load article list with 1k articles under 2s render time',
      { tag: ['@extended'] },
      async ({ page, homePage }) => {
        articleReadTest.fixme(true, 'render time is greater than 2s');
        const articlesCount = 1000;
        const articles = Array.from({ length: articlesCount }, (_, i) => ArticleFactory.buildArticle(i));

        await ArticleUtility.mockGetArticleList(page,
          {
            status: 200,
            body: {
              articles,
              articlesCount,
            },
          }
        );

        const start = Date.now();
        await homePage.goToViaUrl();
        await homePage.articlePreview.toHaveCount(articlesCount);
        const renderTime = Date.now() - start;
        expect(renderTime).toBeLessThan(2000);
      }
    );
    articleReadTest('Show loader while fetching articles',
      { tag: ['@regression'] },
      async ({ homePage, page }) => {
        await ArticleUtility.mockGetArticleList(page, { delay: 1000 });
        await homePage.goToViaUrl();
        await homePage.expectLoadingIndicatorVisible();
      })
  });
});