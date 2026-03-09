import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { Article } from "@article/models/article.model";
import { ArticleDetailsPage } from "@article/pages/article-details.page";
import { ArticleEditorPage } from "@article/pages/article-editor.page";
import { AuthUtility } from "@auth/auth.utility";
import { authTest } from "@auth/fixtures/auth.fixture";
import { RegisterPage } from "@auth/pages/register.page";
import { HomePage } from "@shared/pages/home.page";

export const articleUpdateTest = authTest.extend<{
  token: string;
  article: Article;
  articleEditorPage: ArticleEditorPage;
  articleDetailsPage: ArticleDetailsPage;
  homePage: HomePage;
  registerPage: RegisterPage,
}>({
  token: [async ({ }, use, testInfo) => {
    await use(
      await AuthUtility.createAuthToken(testInfo)
    )
  }, { scope: 'test' }],
  article: [async ({ token }, use, testInfo) => {
    const payload = ArticleFactory.generateTestArticle(testInfo, 'article-update-test');
    const article = await ArticleUtility.createArticleViaApi(token, payload);
    await use(article);
  }, { scope: 'test' }],
  articleEditorPage: async ({ page, article }, use) => {
    const articleEditorPage = new ArticleEditorPage(page);
    await articleEditorPage.gotoArticle(article.slug);
    await articleEditorPage.form.isReady(article);
    await use(articleEditorPage);
  },
  articleDetailsPage: async ({ page }, use) => {
    await use(new ArticleDetailsPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

export const expect = articleUpdateTest.expect;
