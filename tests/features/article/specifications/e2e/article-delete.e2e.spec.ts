import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { deleteArticleTest } from "@article/fixtures/article-delete.fixture";
import { AuthFactory } from "@auth/auth.factory";
import { AuthUtility } from "@auth/auth.utility";
import { CompositeIdFactory } from "@shared/factories/composite-id.factory";
deleteArticleTest.use({ headless: false })
deleteArticleTest.describe('Article - Delete', { tag: ['@article', '@e2e'] }, () => {
  deleteArticleTest.describe('Happy', { tag: '@happy' }, () => {
    deleteArticleTest(
      'Delete article successfully',
      { tag: '@smoke' },
      async ({ articleDetailsPage, homePage, article }) => {
        await articleDetailsPage.deleteArticleFromBanner();
        await homePage.expectOnAuthenticatedHomePage();
        await homePage.expectArticleDeleteSuccess(article.slug);
      }
    );
  });

  deleteArticleTest.describe('Negative', { tag: '@negative' }, () => {
    deleteArticleTest(
      'Return error when deleting nonexistent article',
      { tag: '@regression' },
      async ({ articleDetailsPage, token, article }) => {
        await ArticleUtility.deleteArticle(token, article.slug);
        await articleDetailsPage.deleteArticleFromActions();
        await articleDetailsPage.expectArticleDeleteError(article);
      }
    );

    deleteArticleTest(
      "Prevent user from deleting another user's article",
      { tag: '@regression' },
      async ({ token, page, article, registerPage, articleDetailsPage }, testInfo) => {
        const foreignAuthorPayload = AuthFactory.buildUser(
          CompositeIdFactory.fromExecutionInfo(testInfo, 'foreign-article-author')
        );
        try {
          await AuthUtility.clearAuth(page);
          await registerPage.goto();
          await registerPage.register(foreignAuthorPayload);
          await registerPage.expectRegisterSuccess();
          await articleDetailsPage.goToViaUrl(article.slug);
          await articleDetailsPage.expectArticleVisible(article);
          await articleDetailsPage.expectNonAuthorCannotEditOrDelete();
          await articleDetailsPage.expectNonAuthorCanFollowAndAddToFavorite(article);
        } finally {
          await AuthUtility.deleteUser(foreignAuthorPayload);
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );

    deleteArticleTest(
      'Prevent unauthenticated user from deleting article',
      { tag: '@smoke' },
      async ({ page, token, article, articleDetailsPage }) => {
        try {
          await AuthUtility.clearAuth(page);
          await page.reload();
          await articleDetailsPage.expectArticleVisible(article);
          await articleDetailsPage.expectNonAuthorCannotEditOrDelete();
          await articleDetailsPage.expectNonAuthorCanFollowAndAddToFavorite(article);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
  });

  deleteArticleTest.describe('Edge', { tag: '@edge' }, () => {
    deleteArticleTest(
      'Delete article linked to comments without data inconsistency',
      { tag: '@regression' },
      async ({ articleDetailsPage, homePage, article }, testInfo) => {
        const id = CompositeIdFactory.fromExecutionInfo(testInfo, 'article-deletion-test-add-comment');
        const comment = ArticleFactory.buildArticleComment(id)
        await articleDetailsPage.addComment(comment);
        await articleDetailsPage.commentRow.expectVisible(comment);
        await articleDetailsPage.deleteArticleFromActions();
        await homePage.expectArticleDeleteSuccess(article.slug);
      }
    );

    deleteArticleTest(
      'rollback deletion if API fails',
      { tag: '@regression' },
      async ({ articleDetailsPage, article, token, page }) => {
        try {
          await ArticleUtility.mockArticleDelete(
            page,
            {
              status: 500,
              body: { errors: { body: ['Internal server error'] } },
              slug: article.slug,
            }
          );
          await articleDetailsPage.deleteArticleFromBanner();
          await articleDetailsPage.expectArticleVisible(article);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, article.slug);
        }
      }
    );
  });
});
