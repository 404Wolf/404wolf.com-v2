import { createHashRouter } from "react-router";

import Home from "./pages/home/Home";
import Post from "./pages/posts/Post";
import type { PostFrontmatter } from "./pages/posts/postValidation";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
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
      }

      return {
        frontmatter,
        content: Content,
      };
    },
  },
]); 