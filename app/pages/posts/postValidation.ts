import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import type { Plugin } from 'vite';
import { z } from 'zod';

export const frontmatterSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: z.string().min(1, "Type is required"),
  date: z.string().min(1, "Date is required"),
  covers: z.string().min(1, "Covers is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
}).loose();

export type PostFrontmatter = z.infer<typeof frontmatterSchema>;

interface PostValidatorOptions {
  directory: string;
}

/**
 * Validate frontmatter of posts during build.
 */
export function postValidator({ directory }: PostValidatorOptions): Plugin {
  return {
    name: 'post-validator',
    buildStart: async () => {
      const postsDir = resolve(directory);
      const mdxFiles = await glob('**/*.mdx', { cwd: postsDir });

      const errors: string[] = [];

      await Promise.all(mdxFiles.map(async (file: string) => {
        const filePath = join(postsDir, file);
        const content = await readFile(filePath, 'utf-8');
        const { data: frontmatter } = matter(content);

        try {
          frontmatterSchema.parse(frontmatter);
        } catch (e) {
          errors.push(`Invalid frontmatter in file: ${filePath} - ${e}`);
        }
      }));

      if (errors.length > 0) {
        console.error('Post validation errors:');
        errors.forEach(error => { console.error(error) });
        throw new Error(`Found ${errors.length} validation error(s)`);
      }
    }
  }
}