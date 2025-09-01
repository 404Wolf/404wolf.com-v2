import { cva, type VariantProps } from "class-variance-authority";
import { useState } from "react";
import { cn } from "../lib/utils";

interface HeaderProps extends VariantProps<typeof headerVariants> {
  setBackgroundBlurred: (blurred: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

const Header = ({
  setBackgroundBlurred,
  children,
  variant = "default",
  className,
}: HeaderProps) => {
  const [isBlurred, setIsBlurred] = useState(false);

  const toggleBlur = () => {
    const newBlurState = !isBlurred;
    setIsBlurred(newBlurState);
    setBackgroundBlurred(newBlurState);
  };

  return (
    <div className={cn(headerVariants({ variant }), className)}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-primary">Header Content</h1>
        <button
          type="button"
          onClick={toggleBlur}
          className={cn(toggleButtonVariants())}
        >
          {isBlurred ? "Remove Blur" : "Add Blur"}
        </button>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default Header;

// CVA variants for header
const headerVariants = cva("p-4", {
  variants: {
    variant: {
      default: "bg-background",
      elevated: "bg-surface shadow-sm",
      bordered: "border border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// CVA variants for toggle button
const toggleButtonVariants = cva(
  "px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-blue-600",
        secondary: "bg-secondary text-white hover:bg-gray-600",
        outline: "border border-border bg-background hover:bg-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
