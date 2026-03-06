import { ArticleUtility } from "@article/article.utility";
import { CreateArticleRequest } from "@article/models/article.model";
import { ArticleDetailsPage } from "@article/pages/article-details.page";
import { AuthUtility } from '@auth/auth.utility';
import { authTest } from "@auth/fixtures/auth.fixture";
import { HomePage } from '@shared/pages/home.page';

export const articleReadTest = authTest.extend<{
  homePage: HomePage;
  articleDetailsPage: ArticleDetailsPage;
  articlePayload: CreateArticleRequest;
  token: string;
}>({
  articlePayload: [async ({ }, use, workerInfo) => {
    await use(
      ArticleUtility.generateTestArticle(workerInfo, 'article-read-test')
    );
  }, { scope: 'test' }],
  token: [async ({ }, use, workerInfo) => {
    await use(
      await AuthUtility.createAuthToken(workerInfo)
    )
  }, { scope: 'test' }],
  homePage: async ({ page }, use) => {
    use(new HomePage(page));
  },
  articleDetailsPage: async ({ page }, use) => {
    use(new ArticleDetailsPage(page));
  },
  
});

export const expect = articleReadTest.expect;