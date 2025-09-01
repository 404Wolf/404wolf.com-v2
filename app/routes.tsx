import { createBrowserRouter } from "react-router";

import Home from "./pages/home/Home";
import Post, { type PostLoaderData } from "./pages/posts/Post";
import type { PostFrontmatter } from "./pages/posts/postValidation";
import { getAllPosts } from "./pages/posts/getAllPosts";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    loader: async () => {
      const posts = await getAllPosts();
      return { posts };
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
