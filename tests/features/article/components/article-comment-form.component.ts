import { Locator, Page } from "@playwright/test";

export class ArticleCommentFormComponent {
  readonly writeCommentTextArea: Locator;
  readonly postCommentButton: Locator;

  constructor(private readonly page: Page) {
    this.writeCommentTextArea = this.page.getByRole('textbox', { name: 'Write a comment...' });
    this.postCommentButton = this.page.getByRole('button', { name: 'Post Comment' });
  }

  async fillWriteCommentTextArea(comment: string): Promise<void> {
    await this.writeCommentTextArea.fill(comment);
  }

  async clickPostCommentButton(): Promise<void> {
    await this.postCommentButton.click();
  }
}