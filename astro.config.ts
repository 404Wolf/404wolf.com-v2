import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkToc from "remark-toc";
import { SITE_URL } from "./src/consts.ts";
import { fetchLatestResume } from "./src/resume.ts";

export default defineConfig({
	site: SITE_URL,
	integrations: [
		mdx({
			remarkPlugins: [
				remarkFrontmatter,
				[remarkMdxFrontmatter, { name: "frontmatterData" }],
				[remarkToc, { heading: "Contents" }],
			],
			gfm: true,
			shikiConfig: {
				theme: "github-light-default",
			},
		}),
		sitemap(),
		react(),
	],
	output: "static",
	publicDir: "public",
	vite: {
		plugins: [
			tailwindcss(),
			fetchLatestResume({
				owner: "404wolf",
				repo: "resume-v2",
				releasePath: "resume.pdf",
				outputPath: "resume.pdf",
			}),
		],
	},
	redirects: {
		"/bio": "/about",
		"/resume": "/resume.pdf",
		"/posts": "/",
	},
	adapter: cloudflare({
		platformProxy: {
			enabled: true,
		},
	}),
});
