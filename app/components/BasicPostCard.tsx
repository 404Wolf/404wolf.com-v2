import { Link } from "react-router";
import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import Tag from "./Tag";
import { toTitleCase, randomListItem } from "../utils/misc";

export interface BasicPostData {
  coverUrls: string[];
  coverAlts: string[];
  path: string;
  type: string;
  tags: string[];
  date: string;
  title: string;
}

interface BasicPostCardProps extends VariantProps<typeof cardVariants> {
  post?: BasicPostData;
  tags?: string[];
  className?: string;
}

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

const BasicPostCard = ({ post, tags, size, className }: BasicPostCardProps) => {
  const [currentCoverUrl, setCurrentCoverUrl] = useState("");
  const tagsToUse = tags || post?.tags || [];

  useEffect(() => {
    if (post?.coverUrls?.length) {
      const changeImage = () => {
        setCurrentCoverUrl(randomListItem(post.coverUrls));
      };

      changeImage();
      const interval = setInterval(changeImage, 8000);

      return () => clearInterval(interval);
    }
  }, [post?.coverUrls]);

  const content = (
    <div
      className={imageVariants({ size, interactive: !!post?.path })}
      style={
        currentCoverUrl
          ? { backgroundImage: `url('${currentCoverUrl}')` }
          : { backgroundColor: "rgb(90, 90, 90)" }
      }
    >
      {post && (
        <>
          {/* Type and Tags */}
          <div className="flex gap-1 absolute bottom-0 -left-2">
            {post.type && <Tag>{toTitleCase(post.type)}</Tag>}
            {tagsToUse.map((tag: string) => (
              <Tag key={tag}>{toTitleCase(tag)}</Tag>
            ))}
          </div>

          {/* Date */}
          <Tag position="tr">{post.date}</Tag>

          {/* Title */}
          <h1
            className="text-center text-sm sm:text-lg text-white font-bold"
            style={{ textShadow: "0 0 14px rgba(0, 0, 0, 1)" }}
          >
            {post.title}
          </h1>
        </>
      )}
    </div>
  );

  return (
    <div className={cardVariants({ size, className })}>
      {post?.path ? (
        <Link to={post.path} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export default BasicPostCard;
