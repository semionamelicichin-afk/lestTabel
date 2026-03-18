import { test } from '@playwright/test';
import { AuthPage } from '../src/pages/AuthPage';

const signinUrl = process.env.SIGNIN_URL ?? 'https://lesta.ru/id/signin/';
const storageStatePath = process.env.STORAGE_STATE_PATH ?? 'playwright/.auth/user.json';

test('prepare authenticated storage state', async ({ page }) => {
  const login = process.env.LESTA_LOGIN;
  const password = process.env.LESTA_PASSWORD;

  if (!login || !password) {
    test.skip(true, 'LESTA_LOGIN and LESTA_PASSWORD are required to generate storage state.');
  }

  const authPage = new AuthPage(page);
  await authPage.openSignIn(signinUrl);
  await authPage.signIn(login!, password!);
  await authPage.expectAuthenticated();

  await page.context().storageState({ path: storageStatePath });
});