import { z } from "zod"

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().default(""),
  price: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val > 0, {
    message: "Price must be a positive number",
  }),
})

export const productUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform(val => Number(val)).refine(val => val > 0, {
    message: "Price must be a positive number",
  }).optional(),
})
