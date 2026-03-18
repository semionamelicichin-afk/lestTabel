# Playwright UI Automation (Daily Check-in)

Автотест реализован на Playwright + TypeScript с Page Object паттерном.

## Что делает сценарий

1. Открывает страницу логина `https://lesta.ru/id/signin/`.
2. Авторизуется (из env-переменных) или использует заранее подготовленный `storageState`.
3. Переходит на `https://tanki.su/ru/daily-check-in/`.
4. Находит первый элемент с классом `CalendarItem_base__*`, у которого нет `CalendarItem_complete__*`.
5. Кликает по нему и проверяет, что у этого же элемента появился класс `CalendarItem_complete__*`.

## Локальный запуск

1. Установите Node.js 20+.
2. Скопируйте `.env.example` в `.env` и заполните значения.
3. Установите зависимости:

```bash
npm ci
```

4. Установите браузер:

```bash
npx playwright install chrome
```

5. Запуск daily-check-in теста:

```bash
npm run test:daily
```

Для визуального запуска браузера:

```bash
npm run test:headed
```

## Режим через storageState

Если нужен обход CAPTCHA/2FA, используйте предварительно авторизованную сессию:

1. В `.env` установите:

```dotenv
USE_STORAGE_STATE=true
STORAGE_STATE_PATH=playwright/.auth/user.json
```

2. Сгенерируйте `storageState` (однократно/по необходимости):

```bash
npm run test:auth
```

3. Запускайте основной тест `npm run test:daily`.

## GitHub Actions

Workflow: `.github/workflows/daily-check-in.yml`

- Ежедневный запуск по cron: `30 7 * * *` (это `10:30 MSK`).
- Есть ручной запуск через `workflow_dispatch`.
- При падении загружаются артефакты `test-results` и `playwright-report`.

### Secrets для GitHub

Минимально:

- `LESTA_LOGIN`
- `LESTA_PASSWORD`

Опционально для storageState-режима:

- `USE_STORAGE_STATE` (`true`/`false`)
- `STORAGE_STATE_JSON` (JSON содержимое файла `storageState`)

Если передан `STORAGE_STATE_JSON`, workflow автоматически создаст файл `playwright/.auth/user.json` и включит `USE_STORAGE_STATE=true`.

## Подготовка к выгрузке в GitHub

1. Проверьте, что в репозитории нет чувствительных данных:
	- `.env` не должен быть закоммичен.
	- `playwright/.auth/` не должен быть закоммичен.
	- используйте только `.env.example` как шаблон.

2. Базовая проверка перед пушем:

```bash
npm ci
npx playwright install
npx tsc --noEmit
npm run test:daily
```

3. Инициализация/публикация в GitHub (если нужен новый репозиторий):

```bash
git init
git add .
git commit -m "Initial Playwright daily check-in automation"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Настройка GitHub Actions после пуша

1. В репозитории GitHub откройте `Settings` → `Secrets and variables` → `Actions`.
2. Добавьте секреты:
	- `LESTA_LOGIN`
	- `LESTA_PASSWORD`
	- (опционально) `USE_STORAGE_STATE`
	- (опционально) `STORAGE_STATE_JSON`
3. Откройте вкладку `Actions` и вручную запустите workflow `Daily Check-In UI` через `Run workflow`.
4. Убедитесь, что job проходит и при ошибке прикладываются артефакты.

## Структура проекта

- `src/pages/` — Page Objects (`AuthPage`, `DailyCheckInPage`)
- `tests/` — e2e-тесты (`auth.setup.spec.ts`, `daily-check-in.spec.ts`)
- `.github/workflows/daily-check-in.yml` — ежедневный запуск в 10:30 МСК