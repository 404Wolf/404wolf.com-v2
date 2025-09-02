import { createHashRouter } from "react-router";

import Home, { type HomeLoaderData } from "./pages/home/Home";
import Post, { type PostLoaderData } from "./pages/posts/Post";
import type { PostFrontmatter } from "./pages/posts/postPlugin";
import postsManifest from "virtual:posts-manifest";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
    loader: async () => {
      return { posts: postsManifest } satisfies HomeLoaderData;
    },
  },
  {
    path: "/posts/:id",
    element: <Post />,
    loader: async ({ params }) => {
      const { id } = params as { id: string };

      const postModule = await import(`./pages/posts/posts/${id}.mdx`);
      const { frontmatter, default: Content } = postModule as {
        frontmatter: PostFrontmatter;
        default: React.ComponentType;
      };

      return {
        frontmatter,
        content: Content,
      } satisfies PostLoaderData;
    },
  },
]);
