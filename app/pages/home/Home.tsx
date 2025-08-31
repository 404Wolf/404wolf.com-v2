import Tile from "~/components/Tile";
import Typewriter from "typewriter-effect";
import { BasicAbout } from "~/pages/posts/index";

export function loader() {
  return {};
}

export default function Page() {
  return (
    <div>
      <Tile kind="heading" className="m-2">
        <div className="flex relative">
          <Tile kind="detail" className="absolute -top-6 -left-6">
            <Greeter />
          </Tile>

          <Tile kind="content" className="m-2">
            <BasicAbout />
          </Tile>
          <Tile kind="content" className="m-2">
            <BasicAbout />
          </Tile>
        </div>
      </Tile>
    </div>
  );
}

function Greeter() {
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
