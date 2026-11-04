import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { logInAsTailor } from "./helpers";

async function violations(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("load");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return results.violations.map(
    (violation) =>
      `${path}: ${violation.id} ${violation.help} → ${violation.nodes
        .map((node) => node.target.join(" "))
        .join(", ")}`,
  );
}

async function expectNoViolations(page: Page, paths: string[]) {
  const problems: string[] = [];
  for (const path of paths) problems.push(...(await violations(page, path)));
  expect(problems).toEqual([]);
}

test("public pages have no accessibility problems", async ({ page }) => {
  test.setTimeout(120_000);
  const paths = [
    "/",
    "/garments",
    `/garments/${process.env.E2E_GARMENT_ID}`,
    "/tailors",
    `/tailors/${process.env.E2E_TAILOR_ID}`,
    "/saved",
    "/terms",
    "/login",
    "/join",
    "/login/reset",
  ];
  await expectNoViolations(page, paths);
});

test("tailor pages have no accessibility problems", async ({ page }) => {
  test.setTimeout(120_000);
  await logInAsTailor(page);
  const paths = [
    "/shop",
    "/shop/upload",
    "/shop/requests",
    "/shop/profile",
    "/shop/profile/edit",
    "/shop/profile/pin",
    "/shop/profile/delete",
  ];
  await expectNoViolations(page, paths);
});
