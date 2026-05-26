import PostImageCarousel from "../PostImageCarousel";
import GifPost from "./GifPost";
import PollPost from "./PollPost";

interface PostRendererProps {
  post: any;
  dbUserId: string | null;
}

function PostRenderer({ post, dbUserId }: PostRendererProps) {
  switch (post.type) {
    case "IMAGE":
    case "CAROUSEL":
      return <PostImageCarousel images={post.images || []} />;

    case "GIF":
      return <GifPost gif={post.gif} />;

    case "POLL":
      return <PollPost poll={post.poll} dbUserId={dbUserId} />;

    case "TEXT":
    default:
      return null;
  }
}

export default PostRenderer;
