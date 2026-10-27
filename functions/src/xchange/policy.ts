import { HttpsError } from "firebase-functions/v2/https";
export const categories = [
  "books",
  "electronics",
  "furniture",
  "hostel",
  "bicycles",
  "other",
];
export const conditions = ["new", "like-new", "good", "fair"];
export const contentFields = [
  "title",
  "description",
  "category",
  "condition",
  "mode",
  "pricePaise",
  "swapWanted",
  "imagePaths",
];
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpsError("invalid-argument", "Expected an object.");
  return value as Record<string, unknown>;
}
export function only(value: Record<string, unknown>, keys: string[]) {
  if (Object.keys(value).some((k) => !keys.includes(k)))
    throw new HttpsError("invalid-argument", "Unsupported field.");
}
export function text(
  value: unknown,
  field: string,
  min = 1,
  max = 200,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  return value.trim();
}
export function docId(value: unknown, field: string): string {
  const id = text(value, field, 1, 128);
  if (id.includes("/") || id === "." || id === "..")
    throw new HttpsError("invalid-argument", `Invalid ${field}.`);
  return id;
}
export function retryKey(value: unknown): string {
  const key = text(value, "idempotencyKey", 36, 36);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      key,
    )
  )
    throw new HttpsError("invalid-argument", "Use a UUID retry key.");
  return key.toLowerCase();
}
export function listingContent(value: unknown, uid: string) {
  const v = object(value);
  only(v, contentFields);
  const title = text(v.title, "title", 3, 100),
    description = text(v.description, "description", 10, 2000);
  if (
    typeof v.category !== "string" ||
    !categories.includes(v.category) ||
    typeof v.condition !== "string" ||
    !conditions.includes(v.condition) ||
    typeof v.mode !== "string" ||
    !["sale", "swap", "donation"].includes(v.mode)
  )
    throw new HttpsError(
      "invalid-argument",
      "Choose valid category, condition and mode.",
    );
  const price = v.pricePaise;
  if (
    price !== null &&
    (typeof price !== "number" ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      price > 100_000_000)
  )
    throw new HttpsError(
      "invalid-argument",
      "Invalid price in paise (maximum ₹10 lakh).",
    );
  const swapWanted =
    v.swapWanted === undefined ? "" : text(v.swapWanted, "swapWanted", 0, 200);
  if (
    (v.mode === "sale" && (typeof price !== "number" || price < 1)) ||
    (v.mode === "donation" && price !== 0) ||
    (v.mode === "swap" && (price !== null || !swapWanted))
  )
    throw new HttpsError(
      "invalid-argument",
      "Price does not match the exchange type.",
    );
  if (
    !Array.isArray(v.imagePaths) ||
    v.imagePaths.length < 1 ||
    v.imagePaths.length > 5 ||
    new Set(v.imagePaths).size !== v.imagePaths.length ||
    v.imagePaths.some(
      (p) =>
        typeof p !== "string" ||
        !p.startsWith(`listing-images/${uid}/`) ||
        p.split("/").length !== 4 ||
        p.split("/").some((s: string) => !s || s === "." || s === "..") ||
        p.length > 500,
    )
  )
    throw new HttpsError(
      "invalid-argument",
      "Reference 1–5 distinct owned listing images.",
    );
  return {
    title,
    titleNormalized: title.normalize("NFKC").toLowerCase(),
    description,
    category: v.category as string,
    condition: v.condition as string,
    mode: v.mode as string,
    pricePaise: price as number | null,
    swapWanted,
    imagePaths: v.imagePaths as string[],
  };
}
export function eligible(account: Record<string, unknown> | undefined) {
  if (
    !account ||
    account.accountStatus !== "active" ||
    account.verificationStatus !== "verified" ||
    typeof account.campusId !== "string"
  )
    throw new HttpsError(
      "permission-denied",
      "An active campus-approved account is required.",
    );
  return account.campusId;
}
export function owner(
  item: Record<string, unknown> | undefined,
  uid: string,
  campusId: string,
) {
  if (!item || item.campusId !== campusId)
    throw new HttpsError("not-found", "Listing unavailable.");
  if (item.ownerId !== uid)
    throw new HttpsError(
      "permission-denied",
      "Only the listing owner can make this change.",
    );
  return item;
}
export function editable(item: Record<string, unknown>, expected: unknown) {
  if (!["active", "reserved"].includes(String(item.status)))
    throw new HttpsError("failed-precondition", "This listing is closed.");
  const at = item.updatedAt as { toDate?: () => Date };
  const current = at?.toDate?.().toISOString();
  if (typeof expected !== "string" || !current || current !== expected)
    throw new HttpsError(
      "aborted",
      "Listing changed. Reload it before trying again.",
    );
}
export function transition(from: string, to: unknown) {
  const allowed: Record<string, string[]> = {
    active: ["reserved", "completed", "withdrawn"],
    reserved: ["active", "completed", "withdrawn"],
  };
  if (typeof to !== "string" || !allowed[from]?.includes(to))
    throw new HttpsError(
      "failed-precondition",
      "This status change is not allowed.",
    );
  return to;
}
