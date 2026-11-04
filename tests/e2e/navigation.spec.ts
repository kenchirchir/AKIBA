import { expect, test } from "@playwright/test";
import { logInAsTailor } from "./helpers";

test("the header tabs open their menus and lead to the right page", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "The tab bar is for laptops");
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

test("the phone menu drops down from the top bar", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The top bar is for phones and tablets");
  await page.goto("/");
  const menu = page.getByRole("navigation", { name: "Menu" });

  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Join AKIBA" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await page.getByRole("button", { name: "Open menu" }).click();
  await menu.getByText("Tops", { exact: true }).click();
  await menu.getByRole("link", { name: "Blouses", exact: true }).click();
  await expect(page).toHaveURL(/category=tops&sub=blouses/);
  await expect(menu).toBeHidden();
});

test("the phone filters open next to the search", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The filter button is for phones and tablets");
  await page.goto("/");
  const district = page.getByLabel("District");

  await expect(district).toBeHidden();
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(district).toBeVisible();
  await district.selectOption("gasabo");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/district=gasabo/);

  await page.goto("/tailors");
  await expect(page.getByLabel("Type of tailoring")).toBeHidden();
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.getByLabel("Type of tailoring")).toBeVisible();
});

test("the tailor menu drops down on the shop page", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The top bar is for phones and tablets");
  await logInAsTailor(page);
  await page.goto("/shop");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation", { name: "Menu" });
  await expect(menu.getByRole("link", { name: "Upload" })).toBeVisible();
  await menu.getByRole("link", { name: "Upload" }).click();
  await expect(page).toHaveURL(/\/shop\/upload/);
});
