/// <reference types="vite/client" />

declare module 'virtual:posts-manifest' {
  const postsManifest: import('./pages/posts/postPlugin').PostManifest;
  export default postsManifest;
}
