import { expect, test } from "@playwright/test";
import { logInAsTailor } from "./helpers";

const widths = [375, 390, 820, 1280, 1440];

const publicPaths = () => [
  "/",
  "/garments",
  `/garments/${process.env.E2E_GARMENT_ID}`,
  "/tailors",
  `/tailors/${process.env.E2E_TAILOR_ID}`,
  "/saved",
  "/login",
  "/join",
];

const tailorPaths = [
  "/shop",
  "/shop/upload",
  "/shop/requests",
  "/shop/profile",
  "/shop/profile/edit",
];

test.skip(
  ({ isMobile }) => isMobile,
  "Widths are set inside the test, so it runs once",
);

async function tooWide(page: import("@playwright/test").Page, paths: string[]) {
  const problems: string[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path);
      const extra = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (extra > 0)
        problems.push(`${path} at ${width}px: ${extra}px too wide`);
    }
  }
  return problems;
}

test("no public page scrolls sideways", async ({ page }) => {
  test.setTimeout(180_000);
  expect(await tooWide(page, publicPaths())).toEqual([]);
});

test("no tailor page scrolls sideways", async ({ page }) => {
  test.setTimeout(180_000);
  await logInAsTailor(page);
  expect(await tooWide(page, tailorPaths)).toEqual([]);
});
