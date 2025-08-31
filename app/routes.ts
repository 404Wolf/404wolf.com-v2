import { createHashRouter } from "react-router";

import Home from "./pages/home/Home";
import Post from "./pages/posts/Post";

createHashRouter([
  {
    index: true,
    element: Home(),
  },
  {
    path: "/posts/:id",
    element: Post(),
  },
]);
