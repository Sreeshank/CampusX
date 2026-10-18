import { z } from "zod";
import { CATEGORIES, CONDITIONS, POINTS } from "./constants";

export const listingSchema = z
  .object({
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(2000),
    category: z
      .string()
      .refine((v) => CATEGORIES.includes(v), "Choose a category."),
    condition: z
      .string()
      .refine((v) => CONDITIONS.includes(v), "Choose a condition."),
    mode: z.enum(["sale", "swap", "donation"]),
    pricePaise: z.number().int().nonnegative().nullable(),
    swapWanted: z.string().trim().max(200).optional(),
    imagePaths: z.array(z.string()).min(1).max(5),
    idempotencyKey: z.string().min(1),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.mode === "sale" && (!v.pricePaise || v.pricePaise < 1))
      ctx.addIssue({
        code: "custom",
        path: ["pricePaise"],
        message: "Sale price must be greater than zero.",
      });
    if (v.mode === "donation" && v.pricePaise !== 0)
      ctx.addIssue({
        code: "custom",
        path: ["pricePaise"],
        message: "Donations must be free.",
      });
    if (v.mode === "swap" && (v.pricePaise !== null || !v.swapWanted))
      ctx.addIssue({
        code: "custom",
        path: ["swapWanted"],
        message: "Describe what you want to swap for; swap price must be null.",
      });
  });
export const rideSchema = z
  .object({
    pickupPointId: z.string().refine((v) => POINTS.some((p) => p.id === v)),
    destinationPointId: z
      .string()
      .refine((v) => POINTS.some((p) => p.id === v)),
    departureAt: z
      .string()
      .refine(
        (v) => Number.isFinite(Date.parse(v)) && Date.parse(v) > Date.now(),
        "Choose a future departure.",
      ),
    seatsTotal: z.number().int().min(1).max(6),
    costSharePaise: z.number().int().nonnegative(),
    vehicleType: z.enum(["car", "twoWheeler", "other"]),
    notes: z.string().trim().max(500),
    idempotencyKey: z.string().min(1),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (v.pickupPointId === v.destinationPointId)
      ctx.addIssue({
        code: "custom",
        path: ["destinationPointId"],
        message: "Choose two different places.",
      });
    if (v.vehicleType === "twoWheeler" && v.seatsTotal > 1)
      ctx.addIssue({
        code: "custom",
        path: ["seatsTotal"],
        message: "A two-wheeler can offer one passenger seat.",
      });
  });
export const messageSchema = z.string().trim().min(1).max(2000);
export function errorText(error: unknown): string {
  if (error instanceof z.ZodError)
    return error.issues.map((i) => i.message).join(" ");
  return error instanceof Error
    ? error.message
    : "Something went wrong. Try again.";
}
