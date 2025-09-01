import Typewriter from "typewriter-effect";

export function Greeter() {
  return (
    <div className="relative px-1 text-center">
      <div className="overflow-hidden">
        <span className="text-transparent cursor-none">
          {" "}
          Hi! I'm Wolf Mermelstein{" "}
        </span>
        <span className="absolute left-0">
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
        </span>
      </div>
    </div>
  );
}
