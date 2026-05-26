import PostImageCarousel from "../PostImageCarousel";
import GifPost from "./GifPost";

interface PostRendererProps {
  post: any;
}

function PostRenderer({ post }: PostRendererProps) {
  switch (post.type) {
    case "IMAGE":
    case "CAROUSEL":
      return <PostImageCarousel images={post.images || []} />;

    case "TEXT":
    default:
      return null;

    case "GIF":
      return <GifPost gif={post.gif} />;
  }
}

export default PostRenderer;
