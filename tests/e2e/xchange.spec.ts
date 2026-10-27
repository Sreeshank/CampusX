import { test, expect } from "@playwright/test";
test("create sale, swap and donation listings, preserve validation errors and manage lifecycle", async ({
  page,
}) => {
  for (const mode of ["sale", "swap", "donation"]) {
    await page.goto("/xchange/new");
    await page
      .getByLabel("Item title", { exact: true })
      .fill(`Student ${mode} item`);
    await page
      .getByLabel("Description", { exact: true })
      .fill("A useful item in good condition for campus students.");
    await page.getByLabel("Exchange type").selectOption(mode);
    if (mode === "sale")
      await page.getByLabel("Price (₹)", { exact: true }).fill("350");
    if (mode === "swap")
      await page
        .getByLabel("What would you like in return?")
        .fill("Scientific calculator");
    await page.getByRole("button", { name: "Publish listing" }).click();
    await expect(
      page.getByRole("heading", { name: `Student ${mode} item`, exact: true }),
    ).toBeVisible();
    if (mode === "swap")
      await expect(
        page.getByText("Looking to swap for: Scientific calculator"),
      ).toBeVisible();
    if (mode === "donation")
      await expect(page.getByText("Free", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Reserve item", exact: true })
      .click();
    await expect(page.getByText("reserved", { exact: true })).toBeVisible();
    await page
      .getByRole("button", { name: "Make available", exact: true })
      .click();
    const terminal =
      mode === "sale" ? "sold" : mode === "swap" ? "swapped" : "donated";
    page.once("dialog", (d) => d.accept());
    await page
      .getByRole("button", { name: `Mark ${terminal}`, exact: true })
      .click();
    await expect(page.getByText(terminal, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Edit listing", exact: true }),
    ).toHaveCount(0);
  }
});
test("photo upload rejects invalid file while preserving form and previews multiple valid photos", async ({
  page,
}) => {
  await page.goto("/xchange/new");
  await page.getByLabel("Item title", { exact: true }).fill("Keep my draft");
  await page.getByLabel("Item photos", { exact: true }).setInputFiles({
    name: "bad.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("invalid"),
  });
  await expect(page.getByRole("alert")).toContainText("JPG");
  await expect(page.getByLabel("Item title", { exact: true })).toHaveValue(
    "Keep my draft",
  );
  const png = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#6033eb";
    context.fillRect(0, 0, 16, 16);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const buffer = Buffer.from(png, "base64");
  await page.getByLabel("Item photos", { exact: true }).setInputFiles([
    { name: "one.png", mimeType: "image/png", buffer },
    { name: "two.png", mimeType: "image/png", buffer },
  ]);
  await expect(
    page.getByRole("img", { name: "Item photo 1", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Item photo 2", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove photo 1", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: "Item photo 2", exact: true }),
  ).toHaveCount(0);
});
test("two students propose and confirm a handover; owner cannot bypass it", async ({
  page,
}) => {
  await page.goto("/xchange/book");
  await page
    .getByRole("button", { name: "Message seller", exact: true })
    .click();
  await page.getByLabel("Demo account").selectOption("b");
  await page.goto("/xchange/book");
  await page
    .getByLabel("Student for handover", { exact: true })
    .selectOption("a");
  await page
    .getByRole("button", { name: "Propose handover", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Mark sold", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Confirm handover", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirm handover", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Demo account").selectOption("a");
  await page.goto("/xchange/book");
  await page
    .getByRole("button", { name: "Confirm handover", exact: true })
    .click();
  await expect(
    page.getByText("Both students confirmed this handover."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Message seller", exact: true }),
  ).toBeDisabled();
});
test("feed pagination, URL filters, price sorting and owner status filters", async ({
  page,
}) => {
  await page.goto("/home");
  await page.getByLabel("Demo account").selectOption("b");
  await page.evaluate(() => {
    const key = "campusx-starter-v1",
      s = JSON.parse(localStorage.getItem(key)!);
    const item = s.listings[0];
    s.listings = Array.from({ length: 25 }, (_, i) => ({
      ...item,
      id: `page-${i}`,
      title: `Engineering ${String(i).padStart(2, "0")}`,
      pricePaise: 100 + i,
      ownerId: "b",
      campusId: "kits-warangal",
      mode: "sale",
      status: i === 24 ? "reserved" : "active",
    }));
    localStorage.setItem(key, JSON.stringify(s));
  });
  await page.goto("/xchange");
  await expect(page.locator(".listing-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Load more listings" }).click();
  await expect(page.locator(".listing-card")).toHaveCount(24);
  await page
    .getByRole("textbox", { name: "Search listings" })
    .fill("Engineering 00");
  await expect(page.locator(".listing-card")).toHaveCount(1);
  await expect(page).toHaveURL(/q=Engineering/);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Search listings" }),
  ).toHaveValue("Engineering 00");
  await page
    .getByLabel("Sort listings", { exact: true })
    .selectOption("price-desc");
  await expect(
    page.getByRole("textbox", { name: "Search listings" }),
  ).toHaveValue("");
  await expect(page.locator(".card-title").first()).toHaveText(
    "Engineering 23",
  );
  await page.goto("/my-listings?status=reserved");
  await expect(page.locator(".listing-card")).toHaveCount(1);
});
test("owned and non-owned nested routes fit 360px and desktop", async ({
  page,
}) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/home",
      "/xchange",
      "/xchange/book",
      "/xchange/new",
      "/my-listings",
    ]) {
      await page.goto(route);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto("/xchange/book/edit");
  await expect(
    page.getByRole("heading", { name: "You cannot edit this listing" }),
  ).toBeVisible();
});
