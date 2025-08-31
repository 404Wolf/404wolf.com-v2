import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { MDXProvider } from "@mdx-js/react";
import type { JSX } from "react";

export default function Post() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<{ title: string; date: string; content: JSX.Element } | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const postModule = await import(`./Blogs/${id}.mdx`);
        const { metadata, default: Content } = postModule;
        setPost({
          title: metadata.title,
          date: metadata.date,
          content: <Content />,
        });
      } catch (error) {
        console.error("Error loading post:", error);
      }
    }

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (!post) {
    return <p>Loading...</p>;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div className="metadata">
        <span>Published: {post.date}</span>
      </div>

      <div className="content">
        <MDXProvider>{post.content}</MDXProvider>
      </div>
    </article>
  );
}