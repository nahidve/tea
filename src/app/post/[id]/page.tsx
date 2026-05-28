import { getPostById } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const dbUserId = await getDbUserId();

  return (
    <div className="max-w-2xl mx-auto">
      <PostCard post={post} dbUserId={dbUserId} />
    </div>
  );
}

export default PostPage;
