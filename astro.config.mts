import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

export const MEDIA_DIR = "/media";

export default defineConfig({
	site: "https://404wolf.com",
	integrations: [
		mdx({
			remarkPlugins: [
				remarkFrontmatter,
				[remarkMdxFrontmatter, { name: "frontmatterData" }],
			],
		}),
		sitemap(),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
