import Typewriter from "typewriter-effect";

export function HeaderName({ className, linkTo = "/" }: { className?: string, linkTo?: string }) {
  const Header = <div className={className}>
    <div className="relative">
      <div className="text-transparent mx-px">
        Hi! I'm Wolf Mermelstein
      </div>

      <div className="absolute left-0 top-0">
        <Typewriter
          onInit={(typewriter) => {
            typewriter
              .typeString("Hi! ")
              .pauseFor(700)
              .typeString("I'm Wolf Mermelstein")
              .start();
          }}
          options={{ delay: 70, cursor: "", autoStart: true }}
        />
      </div>
    </div>
  </div>

  return (
    linkTo === undefined ? Header :
      <a href={linkTo} aria-label="Home">{Header}</a>
  )
}