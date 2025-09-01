import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { PostFrontmatter } from "~/pages/posts/postPlugin";
import { toTitleCase } from "../utils/misc";
import Tag from "./Tag";

interface BasicPostCardProps extends VariantProps<typeof cardVariants> {
  post: PostFrontmatter;
  path: string;
  className?: string;
}

const BasicPostCard = ({ post, path, size, className }: BasicPostCardProps) => {
  const [currentCoverUrl, setCurrentCoverUrl] = useState("");
  const tagsToUse = post.tags || [];

  useEffect(() => {
    if (post?.covers) {
      // biome-ignore lint/style/noNonNullAssertion: we know there's at least one
      setCurrentCoverUrl(post.covers.at(0)!);
    }
  }, [post?.covers]);

  const content = (
    <div
      className={imageVariants({ size, interactive: !!post })}
      style={
        currentCoverUrl
          ? { backgroundImage: `url('${currentCoverUrl}')` }
          : { backgroundColor: "rgb(90, 90, 90)" }
      }
    >
      <div className="flex gap-1 absolute bottom-0 -left-2">
        {post.type && <Tag>{toTitleCase(post.type)}</Tag>}
        {tagsToUse.map((tag: string) => (
          <Tag key={tag}>{toTitleCase(tag)}</Tag>
        ))}
      </div>

      <Tag position="tr">{post.date}</Tag>

      <h1
        className="text-center text-sm sm:text-lg text-white font-bold"
        style={{ textShadow: "0 0 14px rgba(0, 0, 0, 1)" }}
      >
        {post.title}
      </h1>
    </div>
  );

  return (
    <div className={cardVariants({ size, className })}>
      {post ? (
        <Link to={path} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export default BasicPostCard;

const cardVariants = cva("relative p-2 group", {
  variants: {
    size: {
      sm: "h-20",
      md: "h-32",
      lg: "h-40",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const imageVariants = cva(
  "bg-cover rounded-xl drop-shadow-md transition-all relative bg-center flex items-center justify-center bg-gray-100/35",
  {
    variants: {
      size: {
        sm: "h-16",
        md: "h-24 lg:h-20",
        lg: "h-32",
      },
      interactive: {
        true: "hover:brightness-90 hover:scale-105 duration-100 ease-in",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      interactive: true,
    },
  },
);
