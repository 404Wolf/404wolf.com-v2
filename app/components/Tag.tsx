import { cva, type VariantProps } from "class-variance-authority";

interface TagProps extends VariantProps<typeof tagVariants> {
  children: React.ReactNode;
  className?: string;
}

const Tag = ({
  children,
  position = "bl",
  variant = "default",
  size = "default",
  className,
}: TagProps) => {
  return (
    <span className={tagVariants({ position, variant, size, className })}>
      {children}
    </span>
  );
};

export default Tag;

const tagVariants = cva(
  "bg-primary text-white font-medium whitespace-nowrap relative",
  {
    variants: {
      position: {
        tl: "absolute top-1 left-1",
        tr: "absolute top-1 right-1",
        bl: "absolute bottom-1 left-1",
        br: "absolute bottom-1 right-1",
      },
      variant: {
        default: "bg-primary text-white",
        secondary: "bg-secondary text-white",
        outline: "border border-border bg-transparent text-foreground",
        ghost: "bg-surface text-foreground",
      },
      size: {
        default: "px-1.5 py-0.5 text-xs rounded-md",
        sm: "px-1 py-0.5 text-xs rounded",
        lg: "px-2 py-1 text-sm rounded-lg",
      },
    },
    defaultVariants: {
      position: "bl",
      variant: "default",
      size: "default",
    },
  },
);
