import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkFrontmatter from "remark-frontmatter";
import { visit } from "unist-util-visit";
import react from "@astrojs/react";

export const BASE_URL = "https://v2.404wolf.com/media";
export const MEDIA_DIR = "/media";

export default defineConfig({
  site: "https://404wolf.com",
  integrations: [mdx({
    remarkPlugins: [
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontmatterData' }],
      () => (tree) => {
        visit(tree, 'image', (node) => {
          // Legacy: handle old media links with | by stripping everything after |
          if (node.url && node.url.includes('|')) {
            node.url = node.url.split('|')[0];
          }
          if (node.url && !node.url.startsWith('http')) {
            node.url = BASE_URL + "/" + node.url;
          }
        });
      },
    ],
  }), sitemap(), react()],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});