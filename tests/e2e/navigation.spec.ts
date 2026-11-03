import { expect, test } from "@playwright/test";

test.skip(({ isMobile }) => isMobile, "The tab bar is for laptops");

test("the header tabs open their menus and lead to the right page", async ({
  page,
}) => {
  await page.goto("/garments");
  const header = page.getByRole("navigation", { name: "Main" });

  await header.getByRole("button", { name: "Browse" }).hover();
  await expect(
    header.getByRole("link", { name: "Blouses", exact: true }),
  ).toBeVisible();

  await header.getByRole("button", { name: "Discover" }).hover();
  await expect(
    header.getByRole("link", { name: "Blouses", exact: true }),
  ).toBeHidden();
  await expect(
    header.getByRole("link", { name: /Made for women/ }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(
    header.getByRole("link", { name: /Made for women/ }),
  ).toBeHidden();
  await expect(header.getByRole("button", { name: "Tailors" })).toHaveCount(0);
  await expect(header.getByRole("link", { name: "Tailors" })).toHaveAttribute(
    "href",
    "/tailors",
  );

  await header.getByRole("button", { name: "Browse" }).click();
  await header.getByRole("link", { name: "Blouses", exact: true }).click();
  await expect(page).toHaveURL(/category=tops&sub=blouses/);
  await expect(
    header.getByRole("link", { name: "Blouses", exact: true }),
  ).toBeHidden();
});
