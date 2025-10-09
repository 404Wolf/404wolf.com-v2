interface CarouselProps {
	images: { href: string; alt: string }[];
}

export function Carousel({ images }: CarouselProps) {
	return (
		<div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory">
			{images.map((image) => (
				<div className="flex-shrink-0 w-full snap-start" key={image.href}>
					<img src={image.href} alt={image.alt} />
				</div>
			))}
		</div>
	);
}
