import { z } from 'zod';

export const projectSchema = z.object({
  order: z.number(),
  year: z.string().optional(),
  title: z.object({ pt: z.string(), en: z.string() }),
  description: z.object({ pt: z.string(), en: z.string() }),
  stack: z.array(z.string()),
  link: z.string().url(),
  repo: z.string().url().optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
