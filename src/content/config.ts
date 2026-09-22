import { defineCollection } from 'astro:content';
import { projectSchema } from './projectSchema';

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => projectSchema.extend({ image: image().optional() }),
});

export const collections = { projects };
