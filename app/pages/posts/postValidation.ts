import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';
import type { Plugin } from 'vite';
import { z } from 'zod';

export const frontmatterSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  date: z.string().regex(/^\d{4}$|^\d{2}-\d{2}-\d{2}$/),
  covers: z.string().min(1),
  tags: z.array(z.enum([
    "academic", "personal", "work", "featured", "hidden", "ongoing"
  ])).min(1),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

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