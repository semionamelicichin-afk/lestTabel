import { expect, Locator, Page } from '@playwright/test';

const baseItemSelector = '[class*="CalendarItem_base__"]';

export class DailyCheckInPage {
  constructor(private readonly page: Page) {}

  async open(url: string): Promise<void> {
    await this.gotoWithRetry(url);
    await this.page.waitForLoadState('load', { timeout: 20000 });
    await this.page.locator(baseItemSelector).first().waitFor({ state: 'visible', timeout: 20000 });
  }

  private async gotoWithRetry(url: string): Promise<void> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        return;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isRetryableAbort = message.includes('net::ERR_ABORTED');

        if (!isRetryableAbort || attempt === 2) {
          throw error;
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Navigation to daily check-in failed');
  }

  getClaimableItems(): Locator {
    return this.page.locator(baseItemSelector);
  }

  async findFirstClaimable(): Promise<Locator | null> {
    const allItems = this.getClaimableItems();
    const count = await allItems.count();

    for (let index = 0; index < count; index += 1) {
      const item = allItems.nth(index);
      const className = await item.getAttribute('class');
      if (!className?.includes('CalendarItem_complete__')) {
        return item;
      }
    }

    return null;
  }

  async claimItem(item: Locator): Promise<void> {
    await item.waitFor({ state: 'visible', timeout: 15000 });
    await item.scrollIntoViewIfNeeded();
    await item.click({ timeout: 20000 });
  }

  async canClick(item: Locator): Promise<boolean> {
    try {
      await item.scrollIntoViewIfNeeded();
      await item.click({ trial: true, timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async expectItemCompleted(item: Locator): Promise<void> {
    await expect(item).toHaveClass(/CalendarItem_complete__/, { timeout: 5000 });
  }
}