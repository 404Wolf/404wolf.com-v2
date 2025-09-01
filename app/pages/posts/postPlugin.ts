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
  async function generateManifest() {
    const postFiles = await glob("./app/pages/posts/posts/*.mdx");
    const posts: PostManifest = [];

    for (const filePath of postFiles) {
      try {
        const content = await readFile(filePath, "utf-8");
        const { data: frontmatter } = matter(content);
        const validatedFrontmatter = frontmatterSchema.parse(frontmatter);
        const fileName = basename(filePath);

        posts.push({
          ...validatedFrontmatter,
          covers: validatedFrontmatter.covers.map(
            (c) => `https://v2.404wolf.com/media/${c}`
          ),
          path: join("posts", fileName.replace(".mdx", "")),
        });
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
        throw new Error(`Validation failed for ${filePath}`);
      }
    }

    // Sort posts by date (newest first)                                                                              
    return posts.sort((a, b) => {
      const getYear = (date: string) =>
        date.length === 4
          ? Number.parseInt(date, 10)
          : Number.parseInt(`20${date.split("-")[2]}`, 10);

      return getYear(b.date) - getYear(a.date);
    });
  }

  return {
    name: "posts-manifest",

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/generated/posts-manifest.json') {
          try {
            const manifest = await generateManifest();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(manifest, null, 2));
          } catch (error) {
            console.error('Error generating manifest:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to generate manifest' }));
          }
        } else {
          next();
        }
      });
    },

    async writeBundle() {
      const manifest = await generateManifest();

      await mkdir("./dist/generated", { recursive: true });
      await writeFile(
        "./dist/generated/posts-manifest.json",
        JSON.stringify(manifest, null, 2)
      );
    }
  };
}
