import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "react-router";
import { toTitleCase } from "../utils/misc";
import Tag from "./Tag";

export interface PostData {
  coverUrl: string | null;
  coverAlt: string | null;
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  createdAt: Date;
  editedAt: Date;
}

interface ExtendedPostCardProps extends VariantProps<typeof cardVariants> {
  coverUrl?: string | null;
  coverAlt?: string | null;
  path: string;
  title: string;
  description: string;
  date: string;
  tags?: string[];
  className?: string;
}

const cardVariants = cva(
  "relative w-full drop-shadow-md hover:drop-shadow-lg hover:scale-[102%] duration-200 group",
  {
    variants: {
      size: {
        sm: "h-32",
        md: "h-40",
        lg: "h-48",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const imageVariants = cva("object-cover rounded-xl w-full h-full", {
  variants: {
    variant: {
      image: "bg-gray-400",
      placeholder: "bg-gray-400",
    },
  },
  defaultVariants: {
    variant: "placeholder",
  },
});

const overlayVariants = cva(
  "absolute z-10 px-2 py-1 text-white text-sm bg-slate-600 rounded-full",
  {
    variants: {
      position: {
        topLeft: "-top-2 -left-2",
        topRight: "-top-2 -right-2",
        bottomLeft: "-bottom-2 -left-2",
        bottomRight: "-bottom-2 -right-2",
      },
      size: {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-sm px-2 py-1",
        lg: "text-base px-3 py-1.5",
      },
    },
    defaultVariants: {
      position: "topLeft",
      size: "md",
    },
  },
);

const descriptionVariants = cva(
  "border-t-2 border-l-2 border-slate-500 absolute right-0 bottom-0 z-30 bg-gray-200 rounded-tl-3xl overflow-hidden p-1 text-xs",
  {
    variants: {
      width: {
        narrow: "w-1/2",
        medium: "w-2/3",
        wide: "w-5/6",
      },
      height: {
        sm: "h-1/3",
        md: "h-1/2",
        lg: "h-2/3",
      },
    },
    defaultVariants: {
      width: "wide",
      height: "md",
    },
  },
);

const ExtendedPostCard = ({
  coverUrl,
  coverAlt,
  path,
  title,
  description,
  date,
  tags = [],
  size,
  className,
}: ExtendedPostCardProps) => {
  return (
    <div className={cardVariants({ size, className })}>
      <Link to={path} className="block relative w-full h-full">
        {/* Cover Image */}
        {coverUrl ? (
          <img
            alt={coverAlt || `${title}'s cover image`}
            src={coverUrl}
            className={imageVariants({ variant: "image" })}
          />
        ) : (
          <div className={imageVariants({ variant: "placeholder" })} />
        )}

        {/* Title */}
        <h1 className={overlayVariants({ position: "topLeft" })}>{title}</h1>

        {/* Date */}
        <div className={overlayVariants({ position: "bottomRight" })}>
          {date}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-1 absolute -bottom-1 -left-2">
            {tags.map((tag) => (
              <Tag key={tag} variant="secondary" size="sm">
                {toTitleCase(tag)}
              </Tag>
            ))}
          </div>
        )}

        {/* Description */}
        <p className={descriptionVariants()}>{description}</p>
      </Link>
    </div>
  );
};

export default ExtendedPostCard;
