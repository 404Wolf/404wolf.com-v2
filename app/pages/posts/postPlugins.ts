import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { glob } from "glob";
import matter from "gray-matter";
import type { Plugin as VitePlugin } from "vite";
import { z } from "zod/v4";
import { unified, type Plugin as UnifiedPlugin } from 'unified';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkStringify from 'remark-stringify';
import remarkMdx from 'remark-mdx';
import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";

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

const VIRTUAL_MODULE_ID = "virtual:posts-manifest";
const RESOLVED_VIRTUAL_MODULE_ID = "\0" + VIRTUAL_MODULE_ID;

/**
 * Vite plugin to generate a manifest of all posts and do validation on post frontmatter.
 */
export function vitePostsManifest({
  mediaDir,
  sourceBaseUrl
}: {
  /** Directory for vendored media */
  mediaDir: string
  /** Base URL to resolve relative media links against */
  sourceBaseUrl: string
}): VitePlugin {
  async function generateManifest() {
    const postFiles = await glob("./app/pages/posts/posts/*.mdx");
    const posts: PostManifest = [];

    for (const filePath of postFiles) {
      const content = await readFile(filePath, "utf-8");
      const { data: frontmatter } = matter(content);
      const validatedFrontmatter = frontmatterSchema.parse(frontmatter);
      const fileName = basename(filePath);

      // Process all image nodes to vendor media links
      const downloads: Promise<void>[] = [];
      await unified()
        .use(remarkParse)
        .use(remarkMdx)
        .use(remarkFrontmatter)
        .use(remarkMdxFrontmatter)
        .use(() => {
          return async (tree: Root) => {
            visit(tree, "image", (node) => {
              const [baseUrl] = node.url.split('|'); // legacy support for |key=value params
              const downloadUrl = new URL(baseUrl, sourceBaseUrl);
              const relPath = downloadUrl.pathname;
              node.url = join(mediaDir, relPath);

              downloads.push((async () => {
                const response = await fetch(downloadUrl.href);
                const localPath = join("dist", mediaDir, relPath);
                await mkdir(dirname(localPath), { recursive: true });
                if (response.body) {
                  const fileStream = createWriteStream(localPath);
                  await response.body.pipeTo(Writable.toWeb(fileStream));
                }
              })());
            });
          };
        })
        .use(remarkStringify)
        .process(content);
      await Promise.all(downloads);

      posts.push({
        ...validatedFrontmatter,
        covers: validatedFrontmatter.covers
          .map((c) => join(mediaDir, c)),
        path: join("posts", fileName.replace(".mdx", "")),
      });
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

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    async load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const manifest = await generateManifest();
        return `export default ${JSON.stringify(manifest)}`;
      }
    },
  };
}