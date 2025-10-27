import Typewriter from "typewriter-effect";

export function HeaderName({
	className,
	linkTo = "/",
	customText,
}: {
	className?: string;
	linkTo?: string;
	customText?: string;
}) {
	const Header = (
		<div className={className}>
			<div className="relative">
				<div className="text-transparent mx-px whitespace-nowrap">
					{customText === undefined ? "Hi! I'm Wolf Mermelstein" : customText}
				</div>

				<div className="absolute left-0 top-0">
					<Typewriter
						onInit={(typewriter) => {
							if (customText === undefined) {
								typewriter
									.typeString("Hi! ")
									.pauseFor(700)
									.typeString("I'm Wolf Mermelstein")
									.start();
							} else {
								typewriter.typeString(customText).start();
							}
						}}
						options={{ delay: 70, cursor: "", autoStart: true }}
					/>
				</div>
			</div>
		</div>
	);

	return linkTo === undefined ? (
		Header
	) : (
		<a href={linkTo} aria-label="Home">
			{Header}
		</a>
	);
}
