import { expect, Page } from '@playwright/test';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async openSignIn(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async signIn(login: string, password: string): Promise<void> {
    const loginInput = this.page.locator(
      'input[name="login"], input[name="username"], input[type="email"], input[type="text"]'
    ).first();
    const passwordInput = this.page.locator('input[type="password"]').first();
    const submitButton = this.page.locator('button[type="submit"], button:has-text("Войти"), button:has-text("ВХОД")').first();

    await loginInput.waitFor({ state: 'visible', timeout: 30000 });
    await loginInput.fill(login);
    await passwordInput.fill(password);
    await Promise.all([
      submitButton.click(),
      this.page.waitForURL((currentUrl) => !/id\/signin/i.test(currentUrl.toString()), {
        timeout: 60000
      })
    ]);
    await this.waitForPageLoaded();
  }

  private async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await this.page.waitForLoadState('load', { timeout: 30000 });
  }

  async expectAuthenticated(): Promise<void> {
    await expect(this.page).not.toHaveURL(/id\/signin/i, { timeout: 30000 });
  }
}