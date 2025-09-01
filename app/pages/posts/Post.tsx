import { MDXProvider } from "@mdx-js/react";
import { useLoaderData } from "react-router";
import type { PostFrontmatter } from "./vite/postValidation";

export interface PostLoaderData {
  frontmatter: PostFrontmatter;
  content: React.ComponentType;
}

export default function Post() {
  const { frontmatter, content: Content } = useLoaderData<PostLoaderData>();

  return (
    <article>
      <h1>{frontmatter.title}</h1>
      <div className="metadata">
        <span>Published: {frontmatter.date}</span>
      </div>

      <div className="content">
        <MDXProvider>
          <Content />
        </MDXProvider>
      </div>
    </article>
  );
}
