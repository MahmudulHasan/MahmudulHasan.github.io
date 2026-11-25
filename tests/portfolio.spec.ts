import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('has the right title and hero', async ({ page }) => {
  await expect(page).toHaveTitle(/Mahmudul Hasan/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mahmudul Hasan');
  await expect(page.getByText('12+ years')).toBeVisible();
});

test('every section exists', async ({ page }) => {
  for (const id of sections) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
});

test('nav links scroll to their sections', async ({ page, isMobile }) => {
  for (const id of sections.slice(1)) {
    if (isMobile) await page.getByTestId('menu-toggle').click();
    await page.locator(`.nav-links a[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`section#${id} h2`)).toBeInViewport();
  }
});

test('shows all GitHub projects with valid links', async ({ page }) => {
  const grid = page.getByTestId('projects');
  await expect(grid.locator('.project')).toHaveCount(7);
  for (const name of ['LaughterMaster', 'EcommercePlaywright', 'webdriverio-typescript-project', 'PostmanReports', 'Leetcode-problems', 'Geeks4Geeks']) {
    const link = grid.locator(`a[href="https://github.com/MahmudulHasan/${name}"]`);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.getByTestId('project-laughtermaster').getByRole('link', { name: /Live demo/ }))
    .toHaveAttribute('href', 'https://laughter-master.vercel.app');
});

test('experience timeline lists 4 roles, newest first', async ({ page }) => {
  const items = page.getByTestId('timeline').locator('> li');
  await expect(items).toHaveCount(4);
  await expect(items.first()).toContainText('CHEQ');
  await expect(items.last()).toContainText('Widespace');
});

test('CV download works', async ({ page, request }) => {
  const href = await page.getByTestId('download-cv').getAttribute('href');
  const res = await request.get(href!);
  expect(res.ok()).toBeTruthy();
  expect(res.headers()['content-type']).toContain('pdf');
});

test('theme toggle switches and remembers the theme', async ({ page, isMobile }) => {
  if (isMobile) await page.getByTestId('menu-toggle').click();
  const html = page.locator('html');
  const before = (await html.getAttribute('data-theme')) ?? 'dark';
  await page.getByTestId('theme-toggle').click();
  const after = before === 'light' ? 'dark' : 'light';
  await expect(html).toHaveAttribute('data-theme', after);
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', after);
});

test('no horizontal scroll', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.reload();
  expect(errors).toEqual([]);
});

for (const theme of ['dark', 'light']) {
  test(`no serious accessibility violations (${theme})`, async ({ page }) => {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    }, theme);
    await page.waitForTimeout(700);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
  });
}
