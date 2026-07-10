import { z } from 'zod'

export const applicationSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1).max(60),
  description: z.string().min(1).max(160),
  url: z.string().min(1),
  icon: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  image: z.string().optional(),
})

export const catalogSchema = z.object({
  apps: z.array(applicationSchema),
})
