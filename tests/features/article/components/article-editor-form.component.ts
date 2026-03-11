import { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures/article-creation.fixture";
import { Article, CreateArticleRequest } from "../models/article.model";

export class ArticleFormComponent {
  readonly container: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyTextArea: Locator;
  readonly tagListInput: Locator;
  readonly tagListItem: Locator;
  readonly publishButton: Locator;

  constructor(private readonly page: Page) {
    this.container = this.page.locator('form');
    this.titleInput = this.container.getByRole('textbox', { name: 'Article Title', exact: true });
    this.descriptionInput = this.container.getByRole('textbox', { name: 'What\'s this article about?', exact: true });
    this.bodyTextArea = this.container.getByRole('textbox', { name: 'Write your article (in markdown)', exact: true });
    this.tagListInput = this.container.getByRole('textbox', { name: 'Enter tags', exact: true });
    this.publishButton = this.container.getByRole('button', { name: 'Publish Article', exact: true });
    this.tagListItem = this.container.locator('.tag-pill');
  }

  async fill(articlePayload: Partial<CreateArticleRequest>): Promise<void> {
    if (articlePayload?.title !== undefined) {
      await this.titleInput.fill(articlePayload.title);
    }
    if (articlePayload?.description !== undefined) {
      await this.descriptionInput.fill(articlePayload.description);
    }
    if (articlePayload?.body !== undefined) {
      await this.bodyTextArea.fill(articlePayload.body);
    }
    if (articlePayload?.tagList?.length) {
      for (const tag of articlePayload.tagList) {
        await this.tagListInput.fill(tag);
        await this.tagListInput.press('Enter');
      }
    }
  }

  async isReady(article: Partial<Article>): Promise<void> {
    const checks: Promise<unknown>[] = [];

    if (article.title) {
      checks.push(expect(this.titleInput).toHaveValue(article.title));
    }

    if (article.description) {
      checks.push(expect(this.descriptionInput).toHaveValue(article.description));
    }

    if (article.body) {
      checks.push(expect(this.bodyTextArea).toHaveValue(article.body));
    }

    if (article.tagList) {
      checks.push(expect(this.tagListItem).toHaveText(article.tagList));
    }

    await Promise.all(checks);
  }

  async submit(): Promise<void> {
    await this.publishButton.click();
  }

  async submitTwice(): Promise<void> {
    await this.publishButton.click();
    await this.publishButton.click({ force: true });
  }

  async updateTagList(
    tagList: string[],
    options: { mode?: 'append' | 'replace' } = {}
  ): Promise<void> {

    const { mode = 'append' } = options;

    if (mode === 'replace') {
      const deleteButtons = this.tagListItem.locator('i');

      const count = await deleteButtons.count();

      for (let i = 0; i < count; i++) {
        await deleteButtons.first().click();
      }
    }

    for (const tag of tagList) {
      await this.tagListInput.fill(tag);
      await this.tagListInput.press('Enter');
    }
  }

  async expectValues(articlePayload: CreateArticleRequest): Promise<void> {
    if (articlePayload.title) await expect(this.titleInput).toHaveValue(articlePayload.title);
    if (articlePayload.description) await expect(this.descriptionInput).toHaveValue(articlePayload.description);
    if (articlePayload.body) await expect(this.bodyTextArea).toHaveValue(articlePayload.body);
    if (articlePayload.tagList) await expect(this.tagListItem).toHaveText(articlePayload.tagList);
  }
}