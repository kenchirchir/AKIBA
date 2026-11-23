import { expect, test } from "@playwright/test";

test("visitors can switch between English and Kinyarwanda", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page
    .getByRole("button", { name: /^(RW|Ikinyarwanda)$/ })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "rw");
  const cookies = await context.cookies();
  expect(cookies.find((cookie) => cookie.name === "NEXT_LOCALE")?.value).toBe(
    "rw",
  );

  await page.goto("/terms");
  await expect(page.locator("html")).toHaveAttribute("lang", "rw");

  await page
    .getByRole("button", { name: /^(EN|English)$/ })
    .last()
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
