import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import viteConfigPaths from "vite-tsconfig-paths";
import { vitePostsManifest } from "./app/pages/posts/postPlugins";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkFrontmatter from "remark-frontmatter";

export const BASE_URL = "https://v2.404wolf.com/media";
export const MEDIA_DIR = "/media";

export default defineConfig({
  plugins: [
    tailwindcss(),
    vitePostsManifest({ mediaDir: MEDIA_DIR, sourceBaseUrl: BASE_URL }),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
      ],
      baseUrl: "/media",
    }),
    react(),
    viteConfigPaths(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    copyPublicDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
});
