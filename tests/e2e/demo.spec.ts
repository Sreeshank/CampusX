import { test, expect } from "@playwright/test";
test("browse, message and change demo participant", async ({ page }) => {
  await page.goto("/home");
  await expect(
    page.getByRole("heading", { name: "Hey, Aarav." }),
  ).toBeVisible();
  await page.goto("/xchange/book");
  await page.getByRole("button", { name: "Message seller" }).click();
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Is this textbook available?");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByLabel("Demo account").selectOption("b");
  await page.goto("/messages");
  await page.getByRole("link").filter({ hasText: "Aarav Reddy" }).click();
  await expect(page.getByText("Is this textbook available?")).toBeVisible();
});
test("request and accept a ride", async ({ page }) => {
  await page.goto("/xride/ride-b");
  await page.getByRole("button", { name: "Request one seat" }).click();
  await expect(page.getByText("pending", { exact: true })).toBeVisible();
  await page.getByLabel("Demo account").selectOption("b");
  await page.goto("/my-rides");
  await page.getByRole("button", { name: "Accept request" }).click();
  await expect(page.getByText("accepted", { exact: true })).toBeVisible();
});
test("pending student is gated and mobile page fits", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/home");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Demo account").selectOption("pending");
  await page.goto("/xchange");
  await expect(page).toHaveURL(/verify/);
});
