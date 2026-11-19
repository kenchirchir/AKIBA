import { expect, test } from "@playwright/test";
import { clickAndWaitForSave, logInAsTailor } from "./helpers";
import { adminPhone, buyerName } from "./test-data";

test("signed-out visitors are sent to the right login page", async ({
  page,
}) => {
  await page.goto("/shop/requests");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/admin/report");
  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/login$/);
});

test("the admin logs in on the same page with a phone number", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Phone number").fill(adminPhone.slice(4));
  await page.locator("input[name=pin]").fill(process.env.E2E_ADMIN_PIN!);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });

  await page.goto("/login");
  await expect(page).toHaveURL(/\/admin$/);
});

test("a wrong PIN is refused", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Phone number").fill("780000903");
  await page.locator("input[name=pin]").fill("10293");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(
    page.getByText("That phone number and PIN don’t match."),
  ).toBeVisible();
});

test("a tailor sees a request and marks it as ordered", async ({ page }) => {
  await logInAsTailor(page);
  await page.goto("/shop/requests");

  const card = page.getByRole("listitem").filter({ hasText: buyerName });
  await expect(card).toBeVisible();
  await clickAndWaitForSave(
    page,
    card.getByRole("button", { name: "Mark as ordered" }),
  );
  await expect(card.getByText("Ordered")).toBeVisible();
  await clickAndWaitForSave(page, card.getByRole("button", { name: "Undo" }));
  await expect(
    card.getByRole("button", { name: "Mark as ordered" }),
  ).toBeVisible();
});

test("the upload form explains what is missing", async ({ page }) => {
  await logInAsTailor(page);
  await page.goto("/shop/upload");
  await page.getByRole("button", { name: "Publish to showcase" }).click();
  await expect(
    page.getByText("Add at least one photo of the garment."),
  ).toBeVisible();
  await expect(page.getByText("Give the garment a name.")).toBeVisible();
});

test("a tailor can turn SMS alerts off and on", async ({ page }) => {
  await logInAsTailor(page);
  await page.goto("/shop/profile");
  const alerts = page.getByRole("switch", {
    name: "SMS alerts for new requests",
  });
  await expect(alerts).toBeChecked();
  await clickAndWaitForSave(page, alerts);
  await expect(alerts).not.toBeChecked();
  await page.reload();
  await expect(alerts).not.toBeChecked();
  await clickAndWaitForSave(page, alerts);
  await expect(alerts).toBeChecked();
});

test("a tailor archives a garment and restores it", async ({
  page,
  request,
}) => {
  const garmentId = process.env.E2E_GARMENT_ID!;
  await logInAsTailor(page);

  await page.goto(`/shop/garments/${garmentId}`);
  await page.getByRole("button", { name: "Archive garment" }).click();
  await expect(page).toHaveURL(/\/shop\?archived=1$/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Archived (1)" }),
  ).toBeVisible();
  expect((await request.get(`/garments/${garmentId}`)).status()).toBe(404);

  await page.goto(`/shop/garments/${garmentId}`);
  await page.getByRole("button", { name: "Restore garment" }).click();
  await expect(page).toHaveURL(/\/shop\?restored=1$/, { timeout: 15_000 });
  expect((await request.get(`/garments/${garmentId}`)).status()).toBe(200);
});
