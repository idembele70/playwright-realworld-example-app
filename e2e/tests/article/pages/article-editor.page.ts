import { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "@shared/layouts/header.component";
import { FRONT_URLS, FRONT_URLS_REG_EXP } from "@shared/utilities/url-front.utility";
import { expect } from "article/article.fixture";
import { ValidationErrorType, ValidatorErrorField } from "article/models/validation-error.model";
import { ArticleFormComponent } from "../article-form.component";
import { Article } from "../models/article.model";

export class ArticleEditorPage {
  readonly urlRegExp = FRONT_URLS_REG_EXP.ARTICLE_EDITOR;

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

  async goto(): Promise<void> {
    await this.page.goto(FRONT_URLS.ARTICLE_EDITOR);
  }

  async navigate(): Promise<void> {
    await this.header.newArticleLink.click();
  }

  async createArticle(article: Partial<Article>): Promise<void> {
    await this.form.fill(article);
    await this.form.submit();
  }

  async expectValidationError(field: ValidatorErrorField, type: ValidationErrorType): Promise<void> {
    await expect(this.errorMessage).toHaveText(`${field} ${type}`);
  }

  async expectOnEditorPage(): Promise<void> {
    await expect(this.page).toHaveURL(this.urlRegExp);
    await expect(this.form.titleInput).toBeVisible();
  }

  async expectApiError(message: string): Promise<void> {
    await expect(this.errorMessage.getByText(message)).toBeVisible();
  }

  async expectPublishButtonDisabled(): Promise<void> {
    await expect(this.form.publishButton).toBeDisabled();
  }
 
  async expectFormValue(article: Partial<Article>): Promise<void> {
    await this.form.expectValues(article);
  }
}