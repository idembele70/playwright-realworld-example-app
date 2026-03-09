import { ArticleFormComponent } from "@article/components/article-form.component";
import { Article, CreateArticleRequest } from "@article/models/article.model";
import { ValidationErrorType, ValidatorErrorField } from "@article/models/validation-error.model";
import { Locator, Page, expect } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS, FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";

export class ArticleEditorPage {
  readonly header: HeaderComponent;
  readonly container: Locator;
  readonly form: ArticleFormComponent;
  readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(this.page);
    this.container = this.page.locator('app-editor-page');
    this.form = new ArticleFormComponent(this.page);
    this.errorMessage = this.container.getByRole('listitem');
  }

  async goto(slug?: string): Promise<void> {
    await this.page.goto(`${FRONT_URLS.ARTICLE_EDITOR}/${slug ?? ''}`);
  }

  async gotoArticle(slug: string): Promise<void> {
    await this.page.goto(`${FRONT_URLS.ARTICLE_EDITOR}/${slug}`);
  }

  async navigate(): Promise<void> {
    await this.header.newArticleLink.click();
  }

  async createArticle(articlePayload: CreateArticleRequest): Promise<void> {
    await this.form.fill(articlePayload);
    await this.form.submit();
  }

  async updateArticle(articlePayload: Partial<CreateArticleRequest>): Promise<void> {
    await this.form.fill(articlePayload);
    await this.form.submit();
  }

  async updateTagList(tagList: string[], options: { mode?: 'append' | 'replace' } = {}): Promise<void> {
    await this.form.updateTagList(
      tagList,
      options,
    );
    await this.form.submit();
  }

  async expectValidationError(field: ValidatorErrorField, type: ValidationErrorType): Promise<void> {
    await expect(this.errorMessage).toHaveText(`${field} ${type}`);
  }

  async expectOnEditorPage(slug?:string): Promise<void> {
    await expect(this.page).toHaveURL(FRONT_URLS_REG_EXP.ARTICLE_EDITOR(slug));
    await expect(this.form.titleInput).toBeVisible();
  }

  async expectApiError(message: string): Promise<void> {
    await expect(this.errorMessage.getByText(message)).toBeVisible();
  }

  async expectPublishButtonDisabled(): Promise<void> {
    await expect(this.form.publishButton).toBeDisabled();
  }

  async expectFormValue(articlePayload: CreateArticleRequest): Promise<void> {
    await this.form.expectValues(articlePayload);
  }
}