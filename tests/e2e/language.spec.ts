import { expect, test } from "@playwright/test";

test("visitors can switch between English and Kinyarwanda", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page
    .getByLabel("Language")
    .filter({ visible: true })
    .selectOption("rw");
  await expect(page.locator("html")).toHaveAttribute("lang", "rw");
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "NEXT_LOCALE")?.value).toBe(
    "rw",
  );

  await page.goto("/terms");
  await expect(page.locator("html")).toHaveAttribute("lang", "rw");
  await expect(
    page.getByLabel("Ururimi").filter({ visible: true }),
  ).toHaveValue("rw");

  await page.getByLabel("Ururimi").filter({ visible: true }).selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
