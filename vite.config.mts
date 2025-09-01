import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import viteConfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react-swc";
import { postValidator } from "./app/pages/posts/postValidation";

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
    postValidator({ directory: "./app/pages/posts/posts" }),
    viteConfigPaths(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "app/index.html",
      },
    },
  },
});
