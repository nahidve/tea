import { getBookmarkedPosts } from "@/actions/bookmark.action";
import PostCard from "@/components/PostCard";
import { getDbUserId } from "@/actions/user.action";

async function SavedPage() {
  const posts = await getBookmarkedPosts();

  const dbUserId = await getDbUserId();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Saved Posts</h1>
        <p className="text-sm text-muted-foreground">Posts you bookmarked</p>
      </div>

      {posts.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No saved posts yet
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId} />
        ))
      )}
    </div>
  );
}

export default SavedPage;
