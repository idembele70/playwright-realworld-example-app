import { expect, Locator, Page } from "@playwright/test";

export class UiUtilities {
  static async expectEscapedContent(pageOrLocator: Page | Locator, payload: string): Promise<void> {
    await expect(
      pageOrLocator.getByText(payload)
    ).toBeVisible();
  }
}