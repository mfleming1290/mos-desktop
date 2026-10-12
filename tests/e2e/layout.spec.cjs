const { test, expect } = require('@playwright/test');

const shell = page => page.getByRole('region', { name: 'MOS Desktop', exact: true });
const frames = page => shell(page).locator('article[data-window-id]');
const visible = page => shell(page).locator('article[data-window-id]:visible');
const button = (page, name) => shell(page).getByRole('button', { name, exact: true });
const taskbar = page => shell(page).getByRole('navigation', { name: 'Applications' });
async function saved(page) {
  await expect(shell(page).getByRole('status').filter({ hasText: /^Layout (saved|restored)/ })).toBeVisible();
}
async function box(locator) {
  const b = await locator.boundingBox();
  expect(b).not.toBeNull();
  const origin = await locator.evaluate(el => {
    const rect = el.closest('.desktop-surface').getBoundingClientRect();
    return { x: rect.x, y: rect.y };
  });
  return { ...b, x: b.x - origin.x, y: b.y - origin.y };
}
async function near(locator, expected) {
  await expect.poll(async () => {
    const actual = await box(locator);
    return Math.max(...['x','y','width','height'].map(k => Math.abs(actual[k] - expected[k])));
  }).toBeLessThan(3);
}
async function drag(page, locator, dx, dy, cancel = false) {
  const b = await locator.boundingBox();
  expect(b).not.toBeNull();
  await page.mouse.move(b.x + Math.min(b.width / 2, 90), b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + Math.min(b.width / 2, 90) + dx, b.y + b.height / 2 + dy, { steps: 12 });
  if (cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
}
test.beforeEach(async ({ page }) => {
  // Fail closed on backend mutations. Layout operations are browser-local;
  // this suite never starts/stops containers or alters unrelated MOS services.
  await page.route('**/api/**', route => {
    if (!['GET','HEAD','OPTIONS'].includes(route.request().method())) return route.abort('blockedbyclient');
    return route.continue();
  });
  await page.goto('/plugins/desktop');
  await expect(shell(page).getByText('Runtime ready', { exact: true })).toBeVisible();
  await button(page, 'Freeform').click();
  // Clean only this fresh isolated context through UI, never the user's storage.
  for (let count = 0; await frames(page).count(); count++) {
    if (count >= 30) throw new Error('Unexpected initial window count');
    const shown = visible(page);
    if (!await shown.count()) await taskbar(page).getByRole('button').last().click();
    await visible(page).last().getByRole('button', { name: 'Close', exact: true }).click();
  }
});

test('mouse dragging commits, Escape cancels, refresh restores geometry', async ({ page }) => {
  await button(page, 'New Clock').click();
  const frame = frames(page).first();
  const initial = await box(frame);
  await drag(page, frame.locator('[data-title]'), 120, 75);
  const moved = { ...initial, x: initial.x + 120, y: initial.y + 75 };
  await near(frame, moved);
  await saved(page);
  await drag(page, frame.locator('[data-title]'), 60, 40, true);
  await near(frame, moved);
  await page.reload();
  await near(frames(page).first(), moved);
  await saved(page);
});

test('mouse resize saves and refresh recovers dimensions', async ({ page }) => {
  await button(page, 'New Clock').click();
  const frame = frames(page).first();
  const initial = await box(frame);
  await drag(page, frame.getByRole('button', { name: 'Resize window' }), 140, 90);
  const resized = { ...initial, width: initial.width + 140, height: initial.height + 90 };
  await near(frame, resized);
  await saved(page);
  await page.reload();
  await near(frames(page).first(), resized);
});

test('dock preview is cancellable and applied docking survives refresh', async ({ page }) => {
  await button(page, 'New Clock').click();
  await button(page, 'New About Desktop').click();
  const before = await Promise.all([box(frames(page).nth(0)), box(frames(page).nth(1))]);
  await button(page, 'Preview dock right').click();
  await expect(shell(page).locator('.dock-preview')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(shell(page).locator('.dock-preview')).toHaveCount(0);
  await near(frames(page).nth(0), before[0]);
  await near(frames(page).nth(1), before[1]);
  await button(page, 'Preview dock right').click();
  await button(page, 'Apply dock').click();
  await expect(visible(page)).toHaveCount(2);
  const first = await box(frames(page).nth(0)), second = await box(frames(page).nth(1));
  expect(Math.abs(first.x - second.x)).toBeGreaterThan(100);
  await saved(page);
  await page.reload();
  await near(frames(page).nth(0), first);
  await near(frames(page).nth(1), second);
});

test('tabs retain draft content, switch by taskbar and restore after refresh', async ({ page }) => {
  await button(page, 'New Clock').click();
  await frames(page).first().getByLabel('Locale', { exact: true }).fill('en-US');
  await button(page, 'New About Desktop').click();
  await button(page, 'Tab windows').click();
  await expect(visible(page)).toHaveCount(1);
  await taskbar(page).getByRole('button', { name: 'Clock', exact: true }).click();
  await expect(visible(page).getByLabel('Locale', { exact: true })).toHaveValue('en-US');
  await visible(page).getByRole('button', { name: 'Apply Clock settings', exact: true }).click();
  await taskbar(page).getByRole('button', { name: 'About Desktop', exact: true }).click();
  await saved(page);
  await page.reload();
  await expect(visible(page)).toHaveCount(1);
  await expect(visible(page)).toHaveAttribute('aria-label', 'About Desktop');
  await taskbar(page).getByRole('button', { name: 'Clock', exact: true }).click();
  await expect(visible(page).getByLabel('Locale', { exact: true })).toHaveValue('en-US');
});

test('keyboard focus, geometry, minimize and close use real key events', async ({ page }) => {
  await button(page, 'New Clock').click();
  await button(page, 'New About Desktop').click();
  await taskbar(page).getByRole('button', { name: 'Clock', exact: true }).click();
  const clock = shell(page).locator('article[aria-label="Clock"]');
  await clock.locator('[data-title]').click();
  const initial = await box(clock);
  await page.keyboard.press('ArrowRight');
  await near(clock, { ...initial, x: initial.x + 10 });
  await page.keyboard.press('Alt+Shift+ArrowRight');
  await expect(shell(page).locator('article.focused')).toHaveAttribute('aria-label', 'About Desktop');
  await page.keyboard.press('Alt+Shift+m');
  await expect(taskbar(page).getByRole('button', { name: 'About Desktop (minimized)', exact: true })).toBeVisible();
  await taskbar(page).getByRole('button', { name: 'About Desktop (minimized)', exact: true }).click();
  await page.keyboard.press('Alt+Shift+x');
  await expect(frames(page)).toHaveCount(1);
});

test('freeform bounds and user minimization survive arrangement changes', async ({ page }) => {
  await button(page, 'New Clock').click();
  await button(page, 'New About Desktop').click();
  const original = await box(frames(page).first());
  await button(page, 'Tile windows').click();
  await expect(visible(page)).toHaveCount(2);
  await button(page, 'Freeform').click();
  await near(frames(page).first(), original);
  await taskbar(page).getByRole('button', { name: 'Clock', exact: true }).click();
  await shell(page).locator('article[aria-label="Clock"]').getByRole('button', { name: 'Minimize', exact: true }).click();
  await button(page, 'Tab windows').click();
  await button(page, 'Freeform').click();
  await expect(taskbar(page).getByRole('button', { name: 'Clock (minimized)', exact: true })).toBeVisible();
  await saved(page);
  await page.reload();
  await expect(taskbar(page).getByRole('button', { name: 'Clock (minimized)', exact: true })).toBeVisible();
});
