import { test, expect } from '@playwright/test'

test('homepage has correct title and content', async ({ page }) => {
  await page.goto('/')
  
  // Check title
  await expect(page).toHaveTitle("Automating Frontend Workflows")
})

test('check for an SVG element', async ({ page }) => {
  // Navigate to the page containing the SVG
  await page.goto('/');

  // Locate the SVG element by its attributes
  const svgLocator = page.locator('svg[xmlns="http://www.w3.org/2000/svg"][viewBox="0 0 128 128"]');

  // Assert that the SVG is visible on the page
  await expect(svgLocator).toBeVisible();
  
  // check svg is valid
  const isSvgValid = await svgLocator.evaluate((svg) => svg.hasAttribute('viewBox'));
  expect(isSvgValid).toBe(true);
});
