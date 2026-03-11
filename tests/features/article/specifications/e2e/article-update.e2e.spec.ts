import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { articleUpdateTest } from "@article/fixtures/article-update.fixture";
import { ArticleEditorPage } from "@article/pages/article-editor.page";
import { AuthFactory } from "@auth/auth.factory";
import { AuthUtility } from "@auth/auth.utility";
import { Page } from "@playwright/test";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
import { SqlInjectionPayloadFactory } from "@shared/factories/sql-injection-payload.factory";
import { XssPayloadFactory } from "@shared/factories/xss-payload-factory";
import { API_URLS, mockApiUrl } from "@shared/utilities/url-api.utility";

articleUpdateTest.describe('Article - Update', { tag: ['@article', '@e2e'] }, () => {
  articleUpdateTest.describe('Happy', { tag: '@happy' }, () => {
    articleUpdateTest(
      'Update article with valid data',
      { tag: '@smoke' },
      async ({ articleEditorPage, articleDetailsPage, token }, testInfo) => {
        try {
          const updatePayload = ArticleFactory.generateTestArticle(
            testInfo,
            'article-update-test-valid-data'
          );
          await articleEditorPage.updateArticle(updatePayload);
          await articleDetailsPage.expectArticleVisible(updatePayload);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(
            token,
            articleDetailsPage.getSlugFromUrl()
          );
        }
      }
    );
    articleUpdateTest(
      'Update article title successfully',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        let slug: string | undefined;
        try {
          const title = 'updated title';
          const updatedArticle = { ...article, title };
          await articleEditorPage.updateArticle({ title });
          await articleDetailsPage.expectArticleVisible(updatedArticle);
          slug = articleDetailsPage.getSlugFromUrl();
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(updatedArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(
            token,
            slug,
          );
        }
      }
    );
    articleUpdateTest(
      'Update article description successfully',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        let slug: string | undefined;
        try {
          const description = 'updated description';
          const updatedArticle = { ...article, description };
          await articleEditorPage.updateArticle({ description });
          await articleDetailsPage.expectArticleVisible(updatedArticle);
          slug = articleDetailsPage.getSlugFromUrl();
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(updatedArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, slug);
        }
      }
    );
    articleUpdateTest(
      'Update article body successfully',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          const body = 'updated body';
          const updatedArticle = { ...article, body };
          await articleEditorPage.updateArticle({ body });
          await articleDetailsPage.expectArticleVisible(updatedArticle);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(updatedArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Update article tags successfully',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          const tagList = ['updated tag'];
          const updatedArticle = { ...article, tagList };
          await articleEditorPage.updateTagList(tagList, { mode: 'replace' });
          await articleDetailsPage.expectArticleVisible(updatedArticle);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(updatedArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Update article tags with empty value',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          const tagList = [];
          const updatedArticle = { ...article, tagList };
          await articleEditorPage.updateTagList(tagList, { mode: 'replace' });
          await articleDetailsPage.expectArticleVisible(updatedArticle);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(updatedArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
  });

  articleUpdateTest.describe('Negative', { tag: '@negative' }, () => {
    articleUpdateTest(
      'Keep current title when title is empty',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          await articleEditorPage.updateArticle({ title: '' });
          await articleDetailsPage.expectArticleVisible(article);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(article);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Keep current description when description is empty',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          await articleEditorPage.updateArticle({ description: '' });
          await articleDetailsPage.expectArticleVisible(article);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(article);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Keep current body when body is empty',
      { tag: '@regression' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }) => {
        try {
          await articleEditorPage.updateArticle({ body: '' });
          await articleDetailsPage.expectArticleVisible(article);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(article);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      "Trying to access another user's article editor redirects to home page",
      { tag: '@regression' },
      async ({ article, page, registerPage, articleEditorPage, homePage, token }, testInfo) => {
        const wrongAuthor = AuthFactory.buildUser(
          CompositeIdFactory.fromExecutionInfo(testInfo, 'wrong-author-modify-article')
        );
        try {
          await AuthUtility.clearAuth(page);
          await registerPage.goto();
          await registerPage.register(wrongAuthor);
          await registerPage.expectRegisterSuccess();
          await articleEditorPage.gotoArticle(article.slug);
          await homePage.expectOnHomePage();
        } finally {
          await AuthUtility.deleteUser(wrongAuthor);
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent SQL injection in article title',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        let slug: string | undefined;
        try {
          const maliciousArticle = {
            ...article,
            title: SqlInjectionPayloadFactory.orEquals(testInfo),
          }
          await articleEditorPage.updateArticle({ title: maliciousArticle.title });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.title)
          slug = articleDetailsPage.getSlugFromUrl();
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent SQL injection in article description',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            description: SqlInjectionPayloadFactory.orEqualsComment(testInfo),
          };
          await articleEditorPage.updateArticle({ description: maliciousArticle.description });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectEscapedContent([maliciousArticle.description], maliciousArticle.title);
          await homePage.articlePreview.expectVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent SQL injection in article body',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            body: SqlInjectionPayloadFactory.dropTable(testInfo),
          };
          await articleEditorPage.updateArticle({ body: maliciousArticle.body });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.body);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent SQL injection in article tags',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            tagList: [SqlInjectionPayloadFactory.unionSelect(testInfo)],
          };
          await articleEditorPage.updateTagList(maliciousArticle.tagList, { mode: 'replace' });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.tagList[0])
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent HTML injection in article title',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        let slug: string | undefined;
        try {
          const maliciousArticle = {
            ...article,
            title: XssPayloadFactory.script(testInfo),
          };
          await articleEditorPage.updateArticle({ title: maliciousArticle.title });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoInjectedScript();
          await articleDetailsPage.expectEscapedContent(maliciousArticle.title);
          slug = articleDetailsPage.getSlugFromUrl();
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
          await homePage.articlePreview.expectEscapedContent([maliciousArticle.title], maliciousArticle.title);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent HTML injection in article description',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            description: XssPayloadFactory.imgOnError(testInfo),
          };
          await articleEditorPage.updateArticle({ description: maliciousArticle.description });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
          await homePage.articlePreview.expectEscapedContent([maliciousArticle.description], maliciousArticle.title);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent HTML injection in article body',
      { tag: '@extended' },
      async ({ articleEditorPage, page, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            body: XssPayloadFactory.svgOnLoad(testInfo)
          };
          await articleEditorPage.updateArticle({ body: maliciousArticle.body });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.body);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'Prevent HTML injection in article tags',
      { tag: '@extended' },
      async ({ articleEditorPage, homePage, articleDetailsPage, token, article }, testInfo) => {
        try {
          const maliciousArticle = {
            ...article,
            tagList: [
              XssPayloadFactory.iframeJavascript(testInfo),
              XssPayloadFactory.inputOnFocus(testInfo),
            ]
          };
          await articleEditorPage.updateTagList(maliciousArticle.tagList, { mode: 'replace' });
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.tagList);
          await articleDetailsPage.expectNoXSS(testInfo);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(maliciousArticle)
          await homePage.articlePreview.expectEscapedContent(maliciousArticle.tagList, maliciousArticle.title)
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
    articleUpdateTest.fixme(
      'unauthenticated user trying to update an article is redirected to the home page',
      {
        tag: '@smoke',
        annotation: {
          type: 'issue',
          description: 'Known bug: unauthenticated user access to editor redirects to a blank page.',
        },
      },
      async ({ page, homePage, token, article }) => {
        try {
          const articleEditorPage = new ArticleEditorPage(page);
          await homePage.goToViaUrl();
          await homePage.expectOnHomePage();
          await AuthUtility.clearAuth(page);
          await articleEditorPage.gotoArticle(article.slug);
          await homePage.expectOnHomePage();
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
  });

  articleUpdateTest.describe('Edge', { tag: '@edge' }, () => {
    articleUpdateTest(
      'handle concurrent updates on the same article',
      async ({ context, article, token, articleEditorPage: editor1, articleDetailsPage }, testInfo) => {
        const payload1 = ArticleFactory.generateTestArticle(
          testInfo,
          'concurrent-update-1'
        );
        const payload2 = ArticleFactory.generateTestArticle(
          testInfo,
          'concurrent-update-2'
        );
        let page2: Page;
        try {
          page2 = await context.newPage();
          const editor2 = new ArticleEditorPage(page2);

          await editor2.gotoArticle(article.slug);

          await editor1.form.fill(payload1);
          await editor2.form.fill(payload2);

          await editor1.form.submit();
          await editor2.form.submit();

          await articleDetailsPage.expectArticleVisible(payload1);
          await editor2.expectOnEditorPage(article.slug);
        } finally {
          await page2.close();
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleUpdateTest(
      'cancel update without saving changes',
      async ({ articleEditorPage, homePage, articleDetailsPage, article, token }, testInfo) => {
        try {
          const updatePayload = ArticleFactory.generateTestArticle(testInfo, 'cancel-change-test');
          await articleEditorPage.form.fill(updatePayload);
          await articleDetailsPage.goToViaUrl(article.slug)
          await articleDetailsPage.expectArticleVisible(article);
          await homePage.goToViaUrl();
          await homePage.articlePreview.expectVisible(article)
        } finally {
          await ArticleUtility.deleteArticle(token, article.slug)
        }
      }
    );
    articleUpdateTest(
      'prefill form with existing article data',
      async ({ articleEditorPage, article, token }) => {
        try {
          await articleEditorPage.form.expectValues(article);
        } finally {
          await ArticleUtility.deleteArticle(token, article.slug);
        }
      }
    );
    articleUpdateTest(
      'disable form when update request is pending',
      async ({ page, articleEditorPage, article }) => {
        const responsePromise = page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.SAVE(article.slug)));
        await ArticleUtility.mockArticleSave(page, { delay: 1000, slug: article.slug });
        await articleEditorPage.form.submit();
        await articleEditorPage.expectPublishButtonDisabled();
        await responsePromise;
      }
    );
    articleUpdateTest(
      'prevent duplicate submit on double click',
      async ({ page, articleEditorPage, article, token }) => {
        try {
          const mock = await ArticleUtility.mockArticleSave(page, { slug: article.slug });
          await Promise.all([
            page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.SAVE(article.slug))),
            articleEditorPage.form.submitTwice(),
          ]);
          await articleUpdateTest.expect.poll(() => mock.getCallCount()).toBe(1);
        } finally {
          await ArticleUtility.deleteArticle(token, article.slug);
        }
      }
    );
  });
});
