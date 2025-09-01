import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { glob } from "glob";
import matter from "gray-matter";
import type { Plugin } from "vite";
import { z } from "zod/v4";

export const validTagTypes = [
  "academic",
  "personal",
  "work",
  "featured",
  "hidden",
  "ongoing",
] as const;

export const frontmatterSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["blog", "project"]),
  date: z.string().regex(/^\d{4}$|^\d{2}-\d{2}-\d{2}$/),
  covers: z.array(z.string().min(1)),
  tags: z.array(z.enum(validTagTypes)),
  description: z.string().optional(),
});

export type PostFrontmatter = z.infer<typeof frontmatterSchema>;

export type PostManifest = (PostFrontmatter & { path: string })[];

/**
 * Vite plugin to generate a manifest of all posts and do validation on post frontmatter.
 */
export async function postPlugin(): Promise<Plugin> {
  const generateManifest = async (outputPath: string) => {
    const posts: PostManifest = [];

    const postFiles = await glob("./app/pages/posts/posts/*.mdx");
    const errors: string[] = [];

    for (const filePath of postFiles) {
      const content = await readFile(filePath, "utf-8");
      const { data: frontmatter } = matter(content);

      const validatedFrontmatter = frontmatterSchema.parse(frontmatter);
      const fileName = basename(filePath);

      validatedFrontmatter.covers = validatedFrontmatter.covers.map((c) =>
        join("/media", c),
      );

      posts.push({
        ...validatedFrontmatter,
        path: join("posts", fileName.replace(".mdx", "")),
      });
    }

    if (errors.length > 0) {
      console.error("Post validation errors:");
      errors.forEach((e) => {
        console.error(e);
      });
      throw new Error(`Found ${errors.length} validation error(s)`);
    }

    const sortedPosts = posts.sort((a, b) => {
      const getYear = (date: string) =>
        date.length === 4
          ? Number.parseInt(date, 10)
          : Number.parseInt(`20${date.split("-")[2]}`, 10);

      const dateA = getYear(a.date);
      const dateB = getYear(b.date);
      return dateB - dateA;
    });

    await mkdir(outputPath, { recursive: true });
    await writeFile(
      join(outputPath, "posts-manifest.json"),
      JSON.stringify(sortedPosts, null, 2),
    );
  };

  return {
    name: "posts-manifest",
    writeBundle: async () => {
      await generateManifest("./dist/public");
    },
  };
}
