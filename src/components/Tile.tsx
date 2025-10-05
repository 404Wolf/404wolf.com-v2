import Typewriter from "typewriter-effect";
import { cva, type VariantProps } from "class-variance-authority";

const titleStyles = cva(
  "bg-slate-600 text-white rounded-xl px-2 py-1 absolute -top-2 z-10",
  {
    variants: {
      side: {
        left: "-left-2",
        right: "-right-2",
      },
    },
    defaultVariants: {
      side: "left",
    },
  }
);

export interface Props extends VariantProps<typeof titleStyles> {
  title?: string;
  kind?: "detail" | "heading" | "content";
  children?: React.ReactNode;
  containerClassName?: string;
  innerClassName?: string;
}

export function Tile({ title, children, containerClassName, innerClassName, side = "left" }: Props) {
  return (
    <div className={`relative ${containerClassName}`}>
      {title && (
        <div className={titleStyles({ side })}>
          <div className="font-semibold text-sm relative">
            <span className="invisible mx-px">{title}</span>
            <span className="absolute inset-0">
              <Typewriter
                onInit={(typewriter) => {
                  typewriter.typeString(title).start();
                }}
                options={{ delay: 70, cursor: "", autoStart: true }}
              />
            </span>
          </div>
        </div>
      )}
      <div className={`bg-gray-300 rounded-xl shadow-md p-5 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
}
