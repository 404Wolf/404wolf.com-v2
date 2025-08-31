import type { Config } from "@react-router/dev/config";
import fs from "node:fs/promises";

export default {
  async prerender() {
    const blogs = await fs.readdir("./app/pages/posts/posts");
    return ["/", ...blogs.map((blog) => `/posts/${blog}`)];
  },
  ssr: true,
  buildDirectory: "./dist",
} satisfies Config;
