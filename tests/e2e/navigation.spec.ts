import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "The tab bar is for laptops");

test("the header tabs open their menus and lead to the right page", async ({
  page,
}) => {
  await page.goto("/garments");
  const header = page.getByRole("navigation", { name: "Main" });

  await header.getByRole("button", { name: "Browse" }).hover();
  await expect(header.getByRole("link", { name: "Blouses" })).toBeVisible();

  await header.getByRole("button", { name: "Tailors" }).hover();
  await expect(header.getByRole("link", { name: "Blouses" })).toBeHidden();
  await expect(
    header.getByRole("link", { name: /Master tailors/ }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(
    header.getByRole("link", { name: /Master tailors/ }),
  ).toBeHidden();

  await header.getByRole("button", { name: "Browse" }).click();
  await header.getByRole("link", { name: "Blouses" }).click();
  await expect(page).toHaveURL(/category=tops&sub=blouses/);
  await expect(header.getByRole("link", { name: "Blouses" })).toBeHidden();
});
