import { test, expect } from '@playwright/test';

test.describe('Workout Timer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('initial state', async ({ page }) => {
    await expect(page.locator('text=Workout Timer')).toBeVisible();
    await expect(page.locator('text=00:00')).toBeVisible();
    await expect(page.locator('text=Round: 1/20')).toBeVisible();
    await expect(page.locator('text=Working')).toBeVisible();
    await expect(page.locator('button[data-testid="play-pause-button"]')).toBeVisible();
  });

  test('start and pause timer', async ({ page }) => {
    // Check initial timer display
    await expect(page.locator('text=00:00')).toBeVisible();

    // Start the timer
    await page.click('button[data-testid="play-pause-button"]');

    // Check if the timer starts at 00:05
    await page.waitForSelector('text=00:05', { state: 'visible', timeout: 5000 });
    await expect(page.locator('text=00:05')).toBeVisible();

    // Wait for the timer to change to 00:03
    await page.waitForSelector('text=00:03', { timeout: 5000 });

    // Pause the timer
    await page.click('button[data-testid="play-pause-button"]');

    // Wait for a short time to ensure the timer has stopped
    await page.waitForTimeout(500);

    // Check if the timer is still at 00:03
    const timerText = await page.locator('text=00:03').textContent();
    expect(timerText).toBe('00:03');
  });

  test('edit timer settings', async ({ page }) => {
    await page.fill('input[value="00:05"]', '00:10');
    await page.fill('input[value="20"]', '5');
    await expect(page.locator('text=Round: 1/5')).toBeVisible();
    await page.click('button[data-testid="play-pause-button"]');
    await expect(page.locator('text=00:10')).toBeVisible();
  });

  test('cycle through exercises', async ({ page }) => {
    await page.fill('input[value="00:05"]', '00:02');
    await page.fill('input[value="00:05"]', '00:01');
    await page.fill('input[value="20"]', '1');
    await page.click('button[data-testid="play-pause-button"]');

    // Wait for the 'Resting' text to appear
    await page.waitForSelector('text=Resting', { state: 'visible', timeout: 5000 });

    // Wait for the next exercise to appear
    await page.waitForSelector('text="FREE WEIGHT - BILATERAL SCAPTION"', { state: 'visible', timeout: 5000 });

    // Verify that the next exercise is visible
    await expect(page.locator('text="FREE WEIGHT - BILATERAL SCAPTION"')).toBeVisible();
  });
});
