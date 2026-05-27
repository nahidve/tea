import { getPosts } from "@/actions/post.action";

import PostImageCarousel from "../PostImageCarousel";
import GifPost from "./GifPost";
import PollPost from "./PollPost";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

interface PostRendererProps {
  post: Post;
  dbUserId: string | null;
}

function PostRenderer({ post, dbUserId }: PostRendererProps) {
  const images = post.images ?? [];

  switch (post.type) {
    case "IMAGE":
    case "CAROUSEL":
      return <PostImageCarousel images={images} />;

    case "GIF":
      if (!post.gif) return null;
      return <GifPost gif={post.gif} />;

    case "POLL":
      if (!post.poll) return null;
      return <PollPost poll={post.poll} dbUserId={dbUserId} />;

    case "TEXT":
    default:
      return null;
  }
}

export default PostRenderer;
