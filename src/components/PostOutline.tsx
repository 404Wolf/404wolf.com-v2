import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { type JSX, useEffect, useState } from "react";

interface MarkdownHeading {
	depth: number;
	slug: string;
	text: string;
}

interface Props {
	headings: MarkdownHeading[];
	/**
	 * Whether to expand the outline ahead of time, and, if so, how deeply.
	 *
	 * Set to `true` to expand all the way, `false` to not expand at all, or a
	 * `number` to choose how deeply to expand it (how many headings deep).
	 */
	expand?: boolean | number;
}

function groupByMinDepth(
	headings: (MarkdownHeading | null)[],
): (MarkdownHeading | null)[][] {
	const minDepth = headings.reduce(
		(min, h) => Math.min(min, h?.depth ?? Infinity),
		Infinity,
	);

	return headings.reduce<(MarkdownHeading | null)[][]>((acc, heading) => {
		if (!heading) return acc;

		if (heading.depth === minDepth) {
			acc.push([heading]);
		} else {
			const last = acc[acc.length - 1];
			if (last) last.push(heading);
			else acc.push([null, heading]);
		}

		return acc;
	}, []);
}

export function PostOutline({ headings, expand = false }: Props) {
	const [activeSlug, setActiveSlug] = useState<string | null>(null);

	useEffect(() => {
		const elements = headings
			.map((h) => document.getElementById(h.slug))
			.filter(Boolean) as HTMLElement[];

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting);

				if (visible.length > 0) {
					const minVisible = visible.reduce((min, entry) =>
						(entry.target as HTMLElement).offsetTop <
						(min.target as HTMLElement).offsetTop
							? entry
							: min,
					);

					setActiveSlug(minVisible.target.id);
				}
			},
			{
				// |--------------------------------|  viewport top
				// |                                |
				// |        ignored area            |  (top 20%)
				// |--------------------------------|  <-- activation zone START
				// |        ACTIVE ZONE (10%)       |
				// |--------------------------------|  <-- activation zone END
				// |                                |
				// |        ignored area            |  (bottom 70%)
				// |--------------------------------|  viewport bottom

				rootMargin: "-20% 0px -70% 0px",

				// If ANY part of the heading is in the ACTIVE ZONE then trigger! Choose
				// the top most heading.
				threshold: 0,
			},
		);

		// When you flip through the headings, track the interaction between the
		// shown headings
		elements.forEach((el) => void observer.observe(el));

		return () => observer.disconnect();
	}, [headings]);

	const renderOutline = (nodes: (MarkdownHeading | null)[]): JSX.Element => {
		const grouped = groupByMinDepth(nodes);

		return (
			<div className="flex flex-col gap-0.5">
				{grouped.map((list) => {
					const [first, ...rest] = list;
					if (!first) return null;

					const shouldExpand =
						expand === true ||
						(typeof expand === "number" && first.depth <= expand);

					return (
						<OutlineItem
							key={first.slug}
							text={first.text}
							slug={first.slug}
							expand={shouldExpand}
							isActive={activeSlug === first.slug}
						>
							{rest.length > 0 && renderOutline(rest)}
						</OutlineItem>
					);
				})}
			</div>
		);
	};

	return renderOutline(headings);
}
function OutlineItem({
	text,
	slug,
	children,
	expand = false,
	isActive = false,
}: {
	text: string;
	slug: string;
	children?: React.ReactNode;
	expand?: boolean;
	isActive?: boolean;
}) {
	if (!children) {
		return (
			<a
				href={`#${slug}`}
				className={styles.postOutline.leafItem({ isActive })}
			>
				<span className={styles.postOutline.leafDot()} />
				<span className="truncate">{text}</span>
			</a>
		);
	}

	return (
		<details open={expand} className="group">
			<summary className={styles.postOutline.summary()}>
				<ChevronRight className={styles.postOutline.chevron()} />
				<a href={`#${slug}`} className={styles.postOutline.link({ isActive })}>
					{text}
				</a>
			</summary>

			<div className={styles.postOutline.children()}>{children}</div>
		</details>
	);
}

/* vga */
/* vga */
const styles = {
	postOutline: {
		summary: cva([
			"flex items-center gap-2",
			"py-1 text-sm font-medium cursor-pointer list-none",
			"text-gray-800 hover:text-black",
			"[&::-webkit-details-marker]:hidden",
		]),

		chevron: cva([
			"h-3 w-3 text-gray-400 transition-transform duration-150",
			"group-open:rotate-90",
		]),

		link: cva(["truncate underline-offset-2"], {
			variants: {
				isActive: {
					true: "text-black underline",
					false: "hover:underline",
				},
			},
			defaultVariants: {
				isActive: false,
			},
		}),

		children: cva(["ml-4 pl-3 border-l border-gray-200 flex flex-col gap-0.5"]),

		leafItem: cva(
			["flex items-center gap-2 py-1 pl-5 text-sm underline-offset-2"],
			{
				variants: {
					isActive: {
						true: "text-black font-medium",
						false: "text-gray-600 hover:text-black hover:underline",
					},
				},
				defaultVariants: {
					isActive: false,
				},
			},
		),

		leafDot: cva([
			"w-1.5 h-1.5 rounded-full bg-gray-400 opacity-60 flex-shrink-0",
		]),
	},
};
