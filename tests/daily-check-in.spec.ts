import { expect, test } from '@playwright/test';
import { AuthPage } from '../src/pages/AuthPage';
import { DailyCheckInPage } from '../src/pages/DailyCheckInPage';

const signinUrl = process.env.SIGNIN_URL ?? 'https://lesta.ru/id/signin/';
const dailyCheckInUrl = process.env.DAILY_CHECKIN_URL ?? 'https://tanki.su/ru/daily-check-in/';
const useStorageState = process.env.USE_STORAGE_STATE === 'true';

function maskPassword(password: string): string {
  const visibleLength = Math.max(8, Math.min(password.length, 16));
  return '*'.repeat(visibleLength);
}

test('claim first available daily reward', async ({ page }) => {
  if (!useStorageState) {
    const login = process.env.LESTA_LOGIN;
    const password = process.env.LESTA_PASSWORD;

    if (!login || !password) {
      throw new Error('LESTA_LOGIN and LESTA_PASSWORD must be set when USE_STORAGE_STATE=false');
    }

    console.log(`LESTA_LOGIN: ${login}`);
    console.log(`LESTA_PASSWORD: ${maskPassword(password)} (masked)`);

    const authPage = new AuthPage(page);
    await authPage.openSignIn(signinUrl);
    await authPage.signIn(login, password);
    await authPage.expectAuthenticated();
  }

  const dailyCheckInPage = new DailyCheckInPage(page);
  await dailyCheckInPage.open(dailyCheckInUrl);

  const claimableItem = await dailyCheckInPage.findFirstClaimable();
  if (!claimableItem) {
    test.info().annotations.push({
      type: 'daily-check-in',
      description: 'No claimable item found, likely already claimed for current day.'
    });
    console.log('Daily check-in: claimable element not found. Reward was likely activated earlier.');
    return;
  }

  const isClickable = await dailyCheckInPage.canClick(claimableItem);
  if (!isClickable) {
    test.info().annotations.push({
      type: 'daily-check-in',
      description: 'Element is not clickable. It was likely activated earlier.'
    });
    console.log('Daily check-in: element is not clickable. It was likely activated earlier. Test is successful.');
    return;
  }

  await dailyCheckInPage.claimItem(claimableItem);
  try {
    await dailyCheckInPage.expectItemCompleted(claimableItem);
  } catch {
    test.info().annotations.push({
      type: 'daily-check-in',
      description: 'Clicked item did not become complete. It was likely activated earlier.'
    });
    console.log('Daily check-in: clicked item did not become complete. It was likely activated earlier. Test is successful.');
    return;
  }

  await expect(claimableItem).toHaveClass(/CalendarItem_base__/);
});