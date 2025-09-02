import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { defineConfig } from "vite";
import viteConfigPaths from "vite-tsconfig-paths";
import { postPlugin } from "./app/pages/posts/postPlugin";

export default defineConfig({
  base: "",
  plugins: [
    tailwindcss(),
    mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: "frontmatter" }],
      ],
      rehypePlugins: [],
    }),
    react(),
    postPlugin(),
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
