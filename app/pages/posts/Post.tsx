import { useLoaderData } from "react-router";
import { MDXProvider } from "@mdx-js/react";
import type { PostFrontmatter } from "./postValidation";

export default function Post() {
  const { frontmatter, content: Content } = useLoaderData<{
    frontmatter: PostFrontmatter;
    content: React.ComponentType;
  }>();

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
