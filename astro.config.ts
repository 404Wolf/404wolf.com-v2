import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { SITE_URL } from "./src/consts.ts";

export default defineConfig({
	site: SITE_URL,
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
	publicDir: "public",
	vite: {
		plugins: [tailwindcss()],
	},
	redirects: {
		"/bio": "/about",
		"/resume": "/resume.pdf",
	},
});
