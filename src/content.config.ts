import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const VALID_TAG_TYPES = [
  "academic",
  "personal",
  "work",
  "featured",
  "hidden",
  "ongoing",
] as const;

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["blog", "project"]),
  date: z.string().regex(/^\d{4}$|^\d{2}-\d{2}-\d{2}$/),
  covers: z.array(z.string().min(1).url()),
  tags: z.array(z.enum(VALID_TAG_TYPES)),
  description: z.string().optional(),
});

export type BlogFrontmatterType = z.infer<typeof blogFrontmatterSchema>;

const blog = defineCollection({
  loader: glob({ base: "./src/posts", pattern: "**/*.{mdx,md}" }),
  schema: () => blogFrontmatterSchema,
});

export const collections = { blog };
