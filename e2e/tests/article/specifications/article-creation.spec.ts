import { ArticleFactory } from "@article/article.factory";
import { ArticleUtility } from "@article/article.utility";
import { articleCreationTest } from "@article/fixtures/article-creation.fixture";
import { CreateArticleRequest } from "@article/models/article.model";
import { ValidationErrorType } from "@article/models/validation-error.model";
import { ArticleEditorPage } from "@article/pages/article-editor.page";
import { AuthUtility } from "@auth/auth.utility";
import { LoginPage } from "@auth/pages/login.page";
import { test as guestTest } from "@playwright/test";
import { SqlInjectionPayloadFactory } from "@shared/factories/sql-injection-payload.factory";
import { XssPayloadFactory } from "@shared/factories/xss-payload-factory";
import { API_URLS, mockApiUrl } from "@shared/utilities/url-api.utility";

articleCreationTest.describe('Article - Creation', { tag: '@article' }, () => {
  articleCreationTest.describe('Happy', { tag: '@happy' }, () => {
    articleCreationTest.afterEach(async ({ articleDetailsPage, token }) => {
      const slug = articleDetailsPage.getSlugFromUrl();
      await ArticleUtility.deleteArticleIfCreated(token, slug);
    });

    articleCreationTest('Create a valid article with valid data', { tag: '@smoke' },
      async ({ articleEditorPage, articleDetailsPage, articlePayload }) => {
        await articleEditorPage.createArticle(articlePayload);
        await articleDetailsPage.expectArticleVisible(articlePayload);
      });
    articleCreationTest('Create article with optional fields empty', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload }) => {
        const newArticle: CreateArticleRequest = { ...articlePayload, tagList: [] };
        await articleEditorPage.createArticle(newArticle);
        await articleDetailsPage.expectArticleVisible(newArticle);
      });
    articleCreationTest('Create article with multiple tags', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload }, testInfo) => {
        const newArticle: CreateArticleRequest = { ...articlePayload, tagList: ArticleFactory.buildArticleTagList(testInfo.parallelIndex, 3) };
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
      async ({ articleEditorPage, articlePayload }) => {
        const invalidArticle: CreateArticleRequest = { ...articlePayload, title: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('title', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error when description is empty', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload }) => {
        const invalidArticle: CreateArticleRequest = { ...articlePayload, description: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('description', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error when body is empty', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload }) => {
        const invalidArticle: CreateArticleRequest = { ...articlePayload, body: '' };
        await articleEditorPage.createArticle(invalidArticle);
        await articleEditorPage.expectValidationError('body', ValidationErrorType.REQUIRED);
        await articleEditorPage.expectOnEditorPage();
      });
    articleCreationTest('Show validation error for duplicate title', { tag: ['@regression'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        let slug: string | undefined;
        try {
          await articleEditorPage.createArticle(articlePayload);
          await articleDetailsPage.expectArticleVisible(articlePayload);
          slug = articleDetailsPage.getSlugFromUrl();
          await articleEditorPage.navigate();
          await articleEditorPage.expectOnEditorPage();
          await articleEditorPage.createArticle(articlePayload);
          await articleEditorPage.expectValidationError('title', ValidationErrorType.UNIQUE);
          await articleEditorPage.expectOnEditorPage();
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, slug);
        }
      });
    articleCreationTest('Prevent SQL injection in article title', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, title: SqlInjectionPayloadFactory.orEqualsHashComment(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article description', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, description: SqlInjectionPayloadFactory.simpleBypass(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article body', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, body: SqlInjectionPayloadFactory.orEmptyEquals(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });
    articleCreationTest('Prevent SQL injection in article tags', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, tagList: [SqlInjectionPayloadFactory.doubleQuoteBypass(testInfo), ...articlePayload.tagList] };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      });

    articleCreationTest('Sanitize HTML content to prevent XSS in title', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articlePayload, articleDetailsPage, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, title: XssPayloadFactory.videoSourceOnError(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.title);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in description', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articlePayload, articleDetailsPage, token }, testInfo) => {
        articleCreationTest.fixme(true, 'Description is not visible on this page');
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, description: XssPayloadFactory.mathJavascript(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.description);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in body', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articlePayload, articleDetailsPage, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, body: XssPayloadFactory.inputOnFocus(testInfo) };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.body);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Sanitize HTML content to prevent XSS in tags', { tag: ['@extended', '@security'] },
      async ({ articleEditorPage, articlePayload, articleDetailsPage, token }, testInfo) => {
        const maliciousArticle: CreateArticleRequest = { ...articlePayload, tagList: [XssPayloadFactory.anchorJavascript(testInfo)] };
        try {
          await articleEditorPage.createArticle(maliciousArticle);
          await articleDetailsPage.expectArticleVisible(maliciousArticle);
          await articleDetailsPage.expectNoXSS(testInfo);
          await articleDetailsPage.expectEscapedContent(maliciousArticle.tagList[0]);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );

    articleCreationTest('Show error message when API fails', { tag: ['@regression'] },
      async ({ page, articleEditorPage, articlePayload }) => {
        const errorMessage = 'Internal server error';
        await ArticleUtility.mockArticleSave(page, {
          status: 500,
          body: { errors: { message: errorMessage } },
        });
        await articleEditorPage.createArticle(articlePayload);
        await articleEditorPage.expectApiError(errorMessage);
      }
    );
    articleCreationTest('Prevent CSRF attack on article creation', { tag: ['@extended', '@security'] },
      async ({ page, articleEditorPage, articlePayload, token, articleDetailsPage }) => {
        articleCreationTest.fixme(true, 'x-csrf-token is not present in the header');
        try {
          await page.route(mockApiUrl(API_URLS.ARTICLES.SAVE()), async route => {
            const headers = route.request().headers();
            if (headers['x-csrf-token'])
              await route.continue();
            else {
              await route.fulfill({
                status: 403,
                body: JSON.stringify({ errors: { body: ['CSRF validation failed'] } })
              })
            }
          });

          await articleEditorPage.createArticle(articlePayload);
        } finally {
          await ArticleUtility.deleteArticle(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Prevent API call without valid JWT token', { tag: ['@extended', '@security'] },
      async ({ page, articleEditorPage, articlePayload }) => {
        await articleEditorPage.expectOnEditorPage();
        await AuthUtility.setFakeToken(page);
        await articleEditorPage.createArticle(articlePayload);
        await articleEditorPage.expectOnEditorPage();
      });
  });

  articleCreationTest.describe('Edge', { tag: '@edge' }, () => {
    articleCreationTest('Create article with very long title', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when title is very long');
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, title: ArticleFactory.buildLongText() };
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
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when body is very long');
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, body: ArticleFactory.buildLongText({ length: 100_000 }) };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with very long tag', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when tags are very long');
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, tagList: [ArticleFactory.buildLongText({ length: 5_000 })] };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with special characters in title', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when title contains special characters');
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, title: ArticleFactory.buildSpecialTextDeterministic() };
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
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'Some special characters are not allowed but end user is not informed about that')
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, body: ArticleFactory.buildSpecialTextDeterministic({ length: 500 }) };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Create article with special characters in tag', { tag: ['@extended'] },
      async ({ articleEditorPage, articleDetailsPage, articlePayload, token }) => {
        articleCreationTest.fixme(true, 'tags are not deleted after article deletion when tags contain special characters');
        try {
          const newArticle: CreateArticleRequest = { ...articlePayload, tagList: [ArticleFactory.buildSpecialTextDeterministic({ length: 50 })] };
          await articleEditorPage.createArticle(newArticle);
          await articleDetailsPage.expectArticleVisible(newArticle);
        } finally {
          await ArticleUtility.deleteArticleIfCreated(token, articleDetailsPage.getSlugFromUrl());
        }
      }
    );
    articleCreationTest('Prevent duplicate article creation on double click', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload, page }) => {
        const mock = await ArticleUtility.mockArticleSave(page, { body: { id: 1 } });
        await articleEditorPage.form.fill(articlePayload);
        await Promise.all([
          articleEditorPage.form.submitTwice(),
          page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.SAVE())),
        ]);
        await articleCreationTest.expect.poll(() => mock.getCallCount()).toBe(1);
      }
    );
    articleCreationTest('Disable submit button while request is pending', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload, page }) => {
        const responsePromise = page.waitForResponse(mockApiUrl(API_URLS.ARTICLES.SAVE()));
        await ArticleUtility.mockArticleSave(page, { delay: 1000 });
        await articleEditorPage.createArticle(articlePayload);
        await articleEditorPage.expectPublishButtonDisabled();
        await responsePromise;
      }
    );
    articleCreationTest('Display validation error messages above title field', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload, page }) => {
        await ArticleUtility.mockArticleSave(page, { body: { title: [ValidationErrorType.UNIQUE] } });
        await articleEditorPage.createArticle(articlePayload);
        await articleEditorPage.expectPublishButtonDisabled();
      }
    );
    articleCreationTest('Keep form values when validation fails', { tag: ['@regression'] },
      async ({ articleEditorPage, articlePayload }) => {
        const invalidArticle: CreateArticleRequest = {
          ...articlePayload,
          body: '',
        };
        await articleEditorPage.form.fill(invalidArticle);

        await articleEditorPage.form.publishButton.click();

        await articleEditorPage.expectOnEditorPage();
        await articleEditorPage.expectFormValue(invalidArticle);
      }
    );
  });
});