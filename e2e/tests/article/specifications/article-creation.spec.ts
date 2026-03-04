import { ArticleDetailsPage } from './../pages/article-details.page';
import { AuthUtility } from "@auth/auth.utility";
import { LoginPage } from "@auth/pages/login.page";
import guestTest, { expect } from "@playwright/test";
import { API_URLS, mockApiUrl } from "@shared/utilities/url-api.utility";
import { ArticleFactory } from "article/article.factory";
import { articleCreationTest } from "article/article.fixture";
import { ArticleUtility } from "article/article.utility";
import { Article } from "article/models/article.model";
import { ValidationErrorType } from "article/models/validation-error.model";
import { ArticleEditorPage } from "article/pages/article-editor.page";

articleCreationTest.describe('Article - Creation', { tag: '@article' }, () => {
  articleCreationTest.describe('Happy', { tag: '@happy' }, () => {
    articleCreationTest.afterEach(async ({ articleDetailsPage, token }) => {
      const slug = articleDetailsPage.getSlugFromUrl();
      await ArticleUtility.deleteArticle(token, slug);
    });

    articleCreationTest('Create a valid article with valid data', { tag: '@smoke' },
      async ({ articleEditorPage, articleDetailsPage, article }) => {
        await articleEditorPage.createArticle(article);
        await articleDetailsPage.expectArticleVisible(article);
      });
    articleCreationTest('Create article with optional fields empty', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, article }) => {
        const newArticle: Article = { ...article, tags: [] };
        await articleEditorPage.createArticle(newArticle);
        await articleDetailsPage.expectArticleVisible(newArticle);
      });
    articleCreationTest('Create article with multiple tags', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, article }, testInfo) => {
        const newArticle: Article = { ...article, tags: ArticleFactory.buildArticleTagList(testInfo.parallelIndex, 3) };
        await articleEditorPage.createArticle(newArticle);
        await articleDetailsPage.expectArticleVisible(newArticle);
      });
  });

  articleCreationTest.describe('Negative', { tag: '@negative' }, () => {
    guestTest('Prevent unauthenticated user from creating article', { tag: ['@smoke'] },
      async ({ page }) => {
        guestTest.fixme(true, 'Description is not visible on this page');
        const articleEditorPage = new ArticleEditorPage(page);
        const loginPage = new LoginPage(page);

        await articleEditorPage.goto();
        await loginPage.expectOnLoginPage();
      });

    articleCreationTest('Show validation error when title is empty', { tag: ['@regression'] },
      async ({ articleEditorPage, article }) => {
        const invalidArticle: Article = { ...article, title: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('title', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error when description is empty', { tag: ['@regression'] },
      async ({ articleEditorPage, article }) => {
        const invalidArticle: Article = { ...article, description: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('description', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error when body is empty', { tag: ['@regression'] },
      async ({ articleEditorPage, article }) => {
        const invalidArticle: Article = { ...article, content: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('body', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error for duplicate title', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        let slug: string;
        try {
          await articleEditorPage.createArticle(article);
          await articleDetailsPage.expectArticleVisible(article);
          slug = articleDetailsPage.getSlugFromUrl();
          await articleEditorPage.navigate();
          await articleEditorPage.expectOnEditorPage();
          await articleEditorPage.createArticle(article);
          await articleEditorPage.expectValidationError('title', ValidationErrorType.UNIQUE);
          await articleEditorPage.expectOnEditorPage();
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, slug);
        }
      });

    articleCreationTest('Prevent SQL injection in article title', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        const maliciousArticle: Article = { ...article, title: "'; DROP TABLE articles; --" };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article description', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        const maliciousArticle: Article = { ...article, description: "' OR '1'='1" };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article body', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        const maliciousArticle: Article = { ...article, content: "'; DROP TABLE users; --" };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article tags', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        const maliciousArticle: Article = { ...article, tags: [...article.tags, "\" OR 1=1 --"] };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });

    articleCreationTest('Sanitize HTML content to prevent XSS in title', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, article, articleDetailsPage, token }) => {
        const maliciousArticle: Article = { ...article, title: `<script>alert("xss")</script>` };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoInjectedScript();
          await articleDetailsPage.expectEscapedContent(maliciousArticle.title);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in description', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, article, articleDetailsPage, token }) => {
        articleCreationTest.fixme(true, 'Description is not visible on this page');
        const maliciousArticle: Article = { ...article, description: `<img src=x onerror=alert(1)>` };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoInjectedScript();
          await articleDetailsPage.expectEscapedContent(maliciousArticle.description);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in body', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, article, articleDetailsPage, token }) => {
        const maliciousArticle: Article = { ...article, content: `<svg/onload=alert(1)>` };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoInjectedScript();
          await articleDetailsPage.expectEscapedContent(maliciousArticle.content);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in tags', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, article, articleDetailsPage, token }) => {
        const maliciousArticle: Article = { ...article, tags: [`<script>alert(document.cookie)</script>`] };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoInjectedScript();
          await articleDetailsPage.expectEscapedContent(maliciousArticle.tags[0]);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );

    articleCreationTest('Show error message when API fails', { tag: ['@regression'] },
      async ({ page, articleEditorPage, article }) => {
        const errorMessage = 'Internal server error';
        await ArticleUtility.mockCreateArticle(page, {
          status: 500,
          body: { errors: { message: errorMessage } },
        });
        await articleEditorPage.createArticle(article);
        await articleEditorPage.expectApiError(errorMessage);
      }
    );
    articleCreationTest('Prevent CSRF attack on article creation', { tag: ['@extended', '@security'] },
      async ({ page, articleEditorPage, article, token, articleDetailsPage }) => {
        articleCreationTest.fixme(true, 'x-csrf-token is not present in the header');
        try {
          await page.route(`**${API_URLS.ARTICLES}`, async route => {
            const headers = route.request().headers();
            if (headers['x-csrf-token'])
              route.continue();
            else {
              await route.fulfill({
                status: 403,
                body: JSON.stringify({ errors: { body: ['CSRF validation failed'] } })
              })
            }
          });

          await articleEditorPage.createArticle(article);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Prevent API call without valid JWT token', { tag: ['@extended', '@security'] },
      async ({ page, articleEditorPage, article }) => {
        await articleEditorPage.expectOnEditorPage();
        await AuthUtility.setFakeToken(page);
        await articleEditorPage.createArticle(article);
        await articleEditorPage.expectOnEditorPage();
      });
  });

  articleCreationTest.describe('Edge', { tag: '@edge' }, () => {
    articleCreationTest('Create article with very long title', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when title is very long');
        try {
          const newArticle: Article = { ...article, title: ArticleFactory.buildLongText() };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with very long description', { tag: ['@extended'] }, async () => {
      articleCreationTest.fixme(true, 'Description is not visible on this page')
    });
    articleCreationTest('Create article with very long body', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when body is very long');
        try {
          const newArticle: Article = { ...article, content: ArticleFactory.buildLongText({ length: 100_000 }) };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with very long tag', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when tags are very long');
        try {
          const newArticle: Article = { ...article, tags: [ArticleFactory.buildLongText({ length: 5_000 })] };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with special characters in title', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when title contains special characters');
        try {
          const newArticle: Article = { ...article, title: ArticleFactory.buildSpecialTextDeterministic() };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with special characters in description', { tag: ['@extended'] }, async () => {
      articleCreationTest.fixme(true, 'Description is not visible on this page')
    });
    articleCreationTest('Create article with special characters in body', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'Some special characters are not allowed but end user is not informed about that')
        try {
          const newArticle: Article = { ...article, content: ArticleFactory.buildSpecialTextDeterministic({ length: 500 }) };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with special characters in tag', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, article, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when tags contain special characters');
        try {
          const newArticle: Article = { ...article, tags: [ArticleFactory.buildSpecialTextDeterministic({ length: 50 })] };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Prevent duplicate article creation on double click', { tag: ['@regression'] },
      async ({ articleEditorPage, article, page }) => {
        const mock = await ArticleUtility.mockCreateArticle(page, { body: { id: 1 } });
        await articleEditorPage.form.fill(article);
        await Promise.all([
          articleEditorPage.form.publishButton.dblclick({ force: true }),
          page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.CREATION)),
        ]);
        await expect.poll(() => mock.getCallCount()).toBe(1);
      }
    );
    articleCreationTest('Disable submit button while request is pending', { tag: ['@regression'] },
      async ({ articleEditorPage, article, page }) => {
        await ArticleUtility.mockCreateArticle(page, { delay: 1000 });
        await articleEditorPage.createArticle(article);
        await articleEditorPage.expectPublishButtonDisabled();
        await page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.CREATION));
      }
    );
    articleCreationTest('Display validation error messages above title field', { tag: ['@regression'] },
      async ({ articleEditorPage, article, page }) => {
        await ArticleUtility.mockCreateArticle(page, { body: { title: [ValidationErrorType.UNIQUE] } });
        await articleEditorPage.createArticle(article);
        await articleEditorPage.expectPublishButtonDisabled();
      }
    );
    articleCreationTest('Keep form values when validation fails', { tag: ['@regression'] },
      async ({ articleEditorPage, article }) => {
        const invalidArticle: Article = {
          ...article,
          content: '',
        };
        await articleEditorPage.form.fill(invalidArticle);

        await articleEditorPage.form.publishButton.click();

        await articleEditorPage.expectOnEditorPage();
        await articleEditorPage.expectFormValue(invalidArticle)
      }
    );
  });
});