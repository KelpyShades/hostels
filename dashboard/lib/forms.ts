import { z } from "zod";

/**
 * Manager form validation — used by react-hook-form via zodResolver.
 * Numbers arrive as strings from the inputs and are validated strictly
 * (digits-only regex) before being transformed, so nothing but a clean
 * integer can ever reach Convex. The server re-validates and sanitizes.
 */

export const roomFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Give the room a name.")
    .max(80, "Keep the name under 80 characters."),
  occupancy: z
    .enum(["1", "2", "3", "4"])
    .transform((value) => Number(value) as 1 | 2 | 3 | 4),
  bathType: z.enum(["shared", "ensuite"]),
  pricePerYear: z
    .string()
    .trim()
    .regex(/^[1-9]\d{0,6}$/, "Whole cedis only — numbers, no letters or symbols.")
    .transform(Number),
  availableCount: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Rooms available must be a whole number, zero or more.")
    .transform(Number),
  accepting: z.boolean(),
  amenities: z.array(z.string()).max(16, "Pick at most 16 amenities."),
});

export type RoomFormInput = z.input<typeof roomFormSchema>;
export type RoomFormOutput = z.output<typeof roomFormSchema>;
