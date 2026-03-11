import { Article } from "@article/models/article.model";
import { expect, Locator } from "@playwright/test";

export class ArticleMetaComponent {
  readonly editArticleButton: Locator;
  readonly deleteArticleButton: Locator;

  readonly followAuthorButton: Locator;

  constructor(private readonly wrapper: Locator) {
    this.editArticleButton = this.wrapper.getByRole('button', { name: /Edit Article$/ });
    this.deleteArticleButton = this.wrapper.getByRole('button', { name: /Delete Article$/ });
    this.followAuthorButton = this.wrapper.getByRole('button', { name: 'follow' });
  }

  async deleteArticle(): Promise<void> {
   await this.deleteArticleButton.click();
  }

  async expectDeleteButtonContainDisabledClass(): Promise<void> {
    await expect(this.deleteArticleButton).toContainClass('disabled');
  }

  async expectEditArticleButtonHidden(): Promise<void> {
    await expect(this.editArticleButton).toBeHidden();
  }

  async expectDeleteArticleButtonHidden(): Promise<void> {
    await expect(this.deleteArticleButton).toBeHidden();
  }

  async expectFollowAuthorButtonVisible(author: Article['author']): Promise<void> {
    await expect(this.followAuthorButton.filter({
      hasText: author.username,
    })).toBeVisible();
  }

  async expectAddToFavoriteButtonVisible(favoritesCount: Article['favoritesCount']): Promise<void> {
    await expect(this.wrapper.getByRole('button',
      { name: new RegExp(String.raw`Favorite Article \(${favoritesCount}\)$`) }
    )).toBeVisible();
  }
}