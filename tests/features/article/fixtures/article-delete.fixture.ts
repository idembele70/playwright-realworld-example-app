import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { Article } from "@article/models/article.model";
import { ArticleDetailsPage } from "@article/pages/article-details.page";
import { AuthUtility } from "@auth/auth.utility";
import { authTest } from "@auth/fixtures/auth.fixture";
import { LoginPage } from "@auth/pages/login.page";
import { RegisterPage } from "@auth/pages/register.page";
import { HomePage } from "@shared/pages/home.page";

export const deleteArticleTest = authTest.extend<{
  token: string;
  article: Article;
  articleDetailsPage: ArticleDetailsPage;
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
}>({
  token: [async ({ }, use, testInfo) => {
    await use(
      await AuthUtility.createAuthToken(testInfo)
    );
  }, { scope: 'test' }],
  article: [async ({ token }, use, testInfo) => {
    const articlePayload = ArticleFactory.generateTestArticle(testInfo, 'article-delete-test');
    const article = await ArticleUtility.createArticleViaApi(token, articlePayload);
    await use(article);
  }, { scope: 'test' }],
  articleDetailsPage: async ({ page, article }, use) => {
    const articleDetailsPage = new ArticleDetailsPage(page);
    await articleDetailsPage.goToViaUrl(article.slug);
    await articleDetailsPage.expectArticleVisible(article);
    await use(articleDetailsPage);
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
});

export const expect = deleteArticleTest.expect;
