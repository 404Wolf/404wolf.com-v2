import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

export const VALID_TYPE_TYPES = ["blog", "project"] as const;

export const VALID_TAG_TYPES = [
	"academic",
	"personal",
	"work",
	"featured",
	"hidden",
	"ongoing",
	"draft",
] as const;

export const postsFrontmatterSchema = z.object({
	title: z.string().min(1),
	type: z.enum(VALID_TYPE_TYPES),
	date: z.string().date(),
	covers: z.array(z.string().url()),
	tags: z.array(z.enum(VALID_TAG_TYPES)),
	description: z.string().optional(),
	links: z
		.array(
			z.tuple([
				z.string().describe("Link text"),
				z.string().url().describe("Link URL"),
			]),
		)
		.optional(),
});

export type BlogFrontmatterType = z.infer<typeof postsFrontmatterSchema>;

const posts = defineCollection({
	loader: glob({ base: "./src/content/posts", pattern: "**/*.{mdx,md}" }),
	schema: () => postsFrontmatterSchema,
});

export const collections = { posts };
