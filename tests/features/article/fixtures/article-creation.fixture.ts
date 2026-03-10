
import { ArticleFactory } from '@article/article.factory';
import { CreateArticleRequest } from '@article/models/article.model';
import { ArticleDetailsPage } from '@article/pages/article-details.page';
import { ArticleEditorPage } from '@article/pages/article-editor.page';
import { AuthUtility } from '@auth/auth.utility';
import { authTest } from '@auth/fixtures/auth.fixture';

export const articleCreationTest = authTest.extend<{
  token: string;
  articlePayload: CreateArticleRequest;
  articleEditorPage: ArticleEditorPage;
  articleDetailsPage: ArticleDetailsPage;
}>({
  articlePayload: [async ({ }, use, workerInfo) => {
    await use(
      ArticleFactory.generateTestArticle(workerInfo, 'article-creation-test')
    );
  }, { scope: 'test' }],
  token: [async ({ }, use, workerInfo) => {
    await use(
      await AuthUtility.createAuthToken(workerInfo)
    )
  }, { scope: 'test' }],
  articleEditorPage: async ({ page }, use) => {
    const articleEditorPage = new ArticleEditorPage(page);
    await articleEditorPage.goto();
    await use(articleEditorPage);
  },
  articleDetailsPage: async ({ page }, use) => {
    const articleDetailsPage = new ArticleDetailsPage(page);
    await use(articleDetailsPage);
  }
});

export const expect = articleCreationTest.expect;