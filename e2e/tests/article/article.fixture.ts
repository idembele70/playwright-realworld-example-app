
import { Article } from './models/article.model';
import { CompositeIdFactory } from '@shared/factories/composite-id.factory';
import { ArticleFactory } from './article.factory';
import { AuthFactory } from '@auth/auth.factory';
import { AuthUtility } from '@auth/auth.utility';
import { ArticleEditorPage } from './pages/article-editor.page';
import { ArticleDetailsPage } from './pages/article-details.page';
import { authTest } from '@auth/fixtures/auth.fixture';

export const articleCreationTest = authTest.extend<{
  token: string;
  article: Article;
  articleEditorPage: ArticleEditorPage;
  articleDetailsPage: ArticleDetailsPage;
}>({
  article: [async ({}, use, workerInfo) => {
    const id = CompositeIdFactory.create('article-test', workerInfo.parallelIndex);
    const article = ArticleFactory.buildArticle(id);
    await use(article);
  }, { scope: 'test' }],
  token: [async ({}, use, workerInfo) => {
    const id = CompositeIdFactory.create('auth-fixture', workerInfo.parallelIndex);
    const user = AuthFactory.buildUser(id);
    const token = await AuthUtility.login(user);
    await use(token)
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