import { test, expect } from "@playwright/test";
test("live view displays loading/error, retries a failed page and appends cursor results", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/live-xchange.html?scenario=load-error");
  await expect(page.getByRole("alert")).toContainText("Test network error");
  await expect(
    page.getByText("Engineering Mathematics", { exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Retry listings", exact: true })
    .click();
  await expect(
    page.locator(".card-title").filter({ hasText: "Live adapter textbook" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Load more listings", exact: true })
    .click();
  await expect(page.locator(".listing-card")).toHaveCount(2);
});
test("live create form keeps draft and retry key after server failure", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/live-xchange.html?scenario=save-error");
  await page
    .getByLabel("Item title", { exact: true })
    .fill("My preserved draft");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A useful textbook with accurate details.");
  await page.getByLabel("Price (₹)", { exact: true }).fill("200");
  await page.getByLabel("Item photos", { exact: true }).setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("fixture"),
  });
  const publish = page.getByRole("button", {
    name: "Publish listing",
    exact: true,
  });
  await expect(publish).toBeEnabled();
  await publish.click();
  await expect(page.getByRole("alert")).toContainText("Test save failed");
  await expect(page.getByLabel("Item title", { exact: true })).toHaveValue(
    "My preserved draft",
  );
  await publish.click();
  await expect(page).toHaveURL(/xchange\/live-book/);
  await expect(
    page.getByRole("heading", { name: "Live adapter textbook", exact: true }),
  ).toBeVisible();
});
test("live failed upload keeps typed form and blocks publishing", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/live-xchange.html?scenario=upload-error");
  await page.getByLabel("Item title", { exact: true }).fill("Keep this form");
  await page.getByLabel("Item photos", { exact: true }).setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: Buffer.from("fixture"),
  });
  await expect(page.getByRole("alert")).toContainText("Test upload failed");
  await expect(page.getByLabel("Item title", { exact: true })).toHaveValue(
    "Keep this form",
  );
  await expect(
    page.getByRole("button", { name: "Publish listing", exact: true }),
  ).toBeDisabled();
});

test("live Home and navigation use the supplied member without a demo account chooser", async ({
  page,
}) => {
  await page.goto("/tests/fixtures/live-xchange.html");
  await page.locator(".card-title").first().click();
  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect(page.getByRole("heading", { name: "Hey, Test." })).toBeVisible();
  await expect(page.getByLabel("Demo account")).toHaveCount(0);
  await expect(page.getByText("Aarav Reddy", { exact: true })).toHaveCount(0);
});
