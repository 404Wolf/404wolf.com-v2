import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://404wolf.com",
  integrations: [
    mdx({
     remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatterData" }],
      ],
     gfm: true,
    }),
    sitemap(),
    react(),
  ],
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});