import { Locator, Page } from "@playwright/test";
import { Article } from "./models/article.model";
import { expect } from "./article.fixture";

export class ArticleFormComponent {
  readonly container: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly contentTextArea: Locator;
  readonly tagsInput: Locator;
  readonly tagListItem: Locator;
  readonly publishButton: Locator;

  constructor(private readonly page: Page) {
    this.container = this.page.locator('form');
    this.titleInput = this.container.getByRole('textbox', { name: 'Article Title', exact: true });
    this.descriptionInput = this.container.getByRole('textbox', { name: 'What\'s this article about?', exact: true });
    this.contentTextArea = this.container.getByRole('textbox', { name: 'Write your article (in markdown)', exact: true });
    this.tagsInput = this.container.getByRole('textbox', { name: 'Enter tags', exact: true });
    this.publishButton = this.container.getByRole('button', { name: 'Publish Article', exact: true });
    this.tagListItem = this.container.locator('.tag-pill');
  }

  async fill(article: Partial<Article>): Promise<void> {
    if (article?.title !== undefined) {
      await this.titleInput.fill(article.title);
    }
    if (article?.description !== undefined) {
      await this.descriptionInput.fill(article.description);
    }
    if (article?.content !== undefined) {
      await this.contentTextArea.fill(article.content);
    }
    if (article?.tags?.length) {
      for (const tag of article.tags) {
        await this.tagsInput.fill(tag);
        await this.tagsInput.press('Enter');
      }
    }
  }

  async submit(): Promise<void> {
    await this.publishButton.click();
  }

  async expectValues(article: Partial<Article>): Promise<void> {
    if (article.title) await expect(this.titleInput).toHaveValue(article.title);
    if (article.description) await expect(this.descriptionInput).toHaveValue(article.description);
    if (article.content) await expect(this.contentTextArea).toHaveValue(article.content);
    if (article.tags) await expect(this.tagListItem).toHaveText(article.tags);
  }
}