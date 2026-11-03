import { expect, type Locator, type Page } from "@playwright/test";
import { verifiedPhone } from "./test-data";

export async function logInAsTailor(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Phone number").fill(verifiedPhone.slice(4));
  await page.locator("input[name=pin]").fill(process.env.E2E_TAILOR_PIN!);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/shop$/);
}

export async function clickAndWaitForSave(page: Page, target: Locator) {
  await Promise.all([
    page.waitForResponse(
      (response) => response.request().method() === "POST" && response.ok(),
    ),
    target.click({ force: true }),
  ]);
}
