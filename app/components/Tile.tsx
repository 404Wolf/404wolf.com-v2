import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";

interface TileProps extends VariantProps<typeof styles> {
  children: React.ReactNode;
  className?: string;
}

export default function Tile({ children, kind, className }: TileProps) {
  return <div className={styles({ kind, className })}>{children}</div>;
}

export const styles = cva(["p-2"], {
  variants: {
    kind: {
      detail: "bg-gray-700 text-white rounded-full",
      heading: "bg-gray-500 text-white rounded-lg",
      content: "bg-gray-300 text-black rounded-lg",
    },
  },
});
