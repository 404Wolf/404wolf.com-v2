import type { PostFrontmatter } from "./postValidation";

// This will be populated at build time with all available posts
const postModules = import.meta.glob("./posts/*.mdx", { eager: true });

export async function getAllPosts(): Promise<PostFrontmatter[]> {
  const posts: PostFrontmatter[] = [];

  for (const [path, module] of Object.entries(postModules)) {
    const postModule = module as { frontmatter: PostFrontmatter };
    if (postModule.frontmatter) {
      // Extract the filename without extension for the path
      const id = path.split("/").pop()?.replace(".mdx", "") || "";
      posts.push({
        ...postModule.frontmatter,
        id,
      });
    }
  }

  // Sort by date (most recent first)
  return posts.sort((a, b) => {
    // Handle both "YYYY" and "MM-DD-YY" format
    const dateA =
      a.date.length === 4
        ? parseInt(a.date)
        : new Date(
            `20${a.date.split("-")[2]}-${a.date.split("-")[0]}-${a.date.split("-")[1]}`,
          ).getFullYear();
    const dateB =
      b.date.length === 4
        ? parseInt(b.date)
        : new Date(
            `20${b.date.split("-")[2]}-${b.date.split("-")[0]}-${b.date.split("-")[1]}`,
          ).getFullYear();
    return dateB - dateA;
  });
}
