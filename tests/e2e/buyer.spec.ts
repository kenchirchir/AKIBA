import { expect, test } from "@playwright/test";
import { garmentName, pendingShopName, shopName } from "./test-data";

test("a buyer reads a story, saves it and requests it", async ({ page }) => {
  await page.goto(`/garments/${process.env.E2E_GARMENT_ID}`);
  await expect(page.getByRole("heading", { name: garmentName })).toBeVisible();
  await expect(page.getByText("5 days")).toBeVisible();

  await page.getByRole("button", { name: "Save garment" }).click();
  await expect(
    page.getByRole("button", { name: "Save garment" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.goto("/saved");
  await expect(page.getByText(garmentName)).toBeVisible();

  await page.goto(`/garments/${process.env.E2E_GARMENT_ID}`);
  await page.getByRole("button", { name: "Request this garment" }).click();
  const sheet = page.getByRole("dialog", { name: "Request this garment" });
  await sheet.getByRole("button", { name: "Send request" }).click();
  await expect(sheet.getByText("Enter your name.")).toBeVisible();

  await sheet.getByLabel("Your name").fill("E2E Buyer");
  await sheet.getByLabel("Your phone number").fill("780000130");
  await sheet.getByLabel("Size").selectOption("m");
  await sheet.getByLabel("Quantity").selectOption("2");
  await sheet.getByLabel("Needed by").fill("2026-12-15");
  await sheet.getByLabel("Best time to call").selectOption("evening");
  await sheet.getByRole("button", { name: "Send request" }).click();

  await expect(page).toHaveURL(/\/request-sent$/);
  await expect(
    page.getByRole("heading", { name: "Request sent" }),
  ).toBeVisible();
  await expect(page.getByText("in the evening")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Call Aline now/ }),
  ).toBeVisible();
});

test("the tailors list shows verified tailors only", async ({ page }) => {
  await page.goto("/tailors?q=e2e");
  await expect(page.getByText(shopName)).toBeVisible();
  await expect(page.getByText(pendingShopName)).toHaveCount(0);

  await page.getByText(shopName).click();
  await expect(page.getByRole("heading", { name: shopName })).toBeVisible();
  await expect(page.getByText("Verified tailor")).toBeVisible();
});

test("a shop waiting for verification has no public page", async ({
  request,
}) => {
  const response = await request.get(
    `/tailors/${process.env.E2E_PENDING_TAILOR_ID}`,
  );
  expect(response.status()).toBe(404);
});

test("the Request sent page is only for the buyer who sent it", async ({
  page,
}) => {
  await page.goto(`/garments/${process.env.E2E_GARMENT_ID}/request-sent`);
  await expect(page).toHaveURL(
    new RegExp(`/garments/${process.env.E2E_GARMENT_ID}$`),
  );
});
