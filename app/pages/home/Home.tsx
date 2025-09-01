import { useLoaderData } from "react-router";
import Tile from "~/components/Tile";
import BasicPostCard from "~/components/BasicPostCard";
import { BasicAbout } from "~/pages/posts/index";
import { Greeter } from "./Greeter";
import type { PostFrontmatter } from "~/pages/posts/postValidation";

interface HomeLoaderData {
  posts: PostFrontmatter[];
}

export default function Page() {
  const { posts } = useLoaderData<HomeLoaderData>();

  // Convert PostFrontmatter to BasicPostData format
  const convertToBasicPostData = (post: PostFrontmatter) => ({
    coverUrls: [post.covers], // Assuming covers is a single image, convert to array
    coverAlts: [post.title || post.id],
    path: `/posts/${post.id}`,
    type: post.type,
    tags: post.tags,
    date: post.date,
    title: post.title || post.id,
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-4 p-4">
      {/* Left side - Posts Grid */}
      <div className="lg:w-1/3 xl:w-1/4">
        <h2 className="text-2xl font-bold mb-4 text-center">Projects</h2>
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <BasicPostCard
              key={post.id}
              post={convertToBasicPostData(post)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Right side - Main content */}
      <div className="lg:w-2/3 xl:w-3/4">
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
    </div>
  );
}
