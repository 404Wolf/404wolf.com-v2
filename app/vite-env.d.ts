/// <reference types="vite/client" />

declare module "virtual:posts-manifest" {
  const postsManifest: import("./pages/posts/postPlugins").PostManifest;
  export default postsManifest;
}
