import { useMemo } from "react";
import { useLoaderData } from "react-router";
import BasicPostCard from "~/components/BasicPostCard";
import Tile from "~/components/Tile";
import { BasicAbout } from "~/pages/posts/index";
import type { PostManifest } from "~/pages/posts/postPlugin";
import { Greeter } from "./Greeter";

export interface HomeLoaderData {
  posts: PostManifest;
}

export default function Page() {
  const { posts } = useLoaderData<HomeLoaderData>();

  const featuredPosts = useMemo(
    () => posts.filter((post) => post.tags.includes("featured")).slice(0, 3),
    [posts],
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 p-4">
      <div className="lg:w-2/3 xl:w-3/4">
        <Tile kind="heading" className="m-2">
          <div className="flex relative">
            <Tile kind="detail" className="absolute -top-6 -left-6">
              <Greeter />
            </Tile>

            <Tile kind="content" className="m-2">
              <div className="lg:w-1/3 xl:w-1/4">
                <div className="grid grid-cols-1 gap-4">
                  {featuredPosts.map((post) => (
                    <BasicPostCard
                      key={post.path}
                      post={post}
                      path={post.path}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            </Tile>

            <Tile kind="content" className="m-2">
              <BasicAbout />
            </Tile>
          </div>
        </Tile>
      </div>
    </div>
  );
}
