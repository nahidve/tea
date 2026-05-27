"use client";

import {
  createComment,
  deletePost,
  getPosts,
  toggleLike,
} from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import {
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
  BookmarkIcon,
} from "lucide-react";
import { Textarea } from "./ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "./ui/custom/GlassPanel";
import GradientButton from "./ui/custom/GradientButton";
import AnimatedContainer from "./ui/custom/AnimatedContainer";
import PostRenderer from "./post-types/PostRenderer";
import { toggleBookmark } from "@/actions/bookmark.action";
import { Repeat2Icon } from "lucide-react";
import { repostPost } from "@/actions/post.action";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId),
  );
  const [optimisticLikes, setOptmisticLikes] = useState(post._count.likes);
  const [hasBookmarked, setHasBookmarked] = useState(
    post.bookmarks.some((bookmark) => bookmark.userId === dbUserId),
  );

  const [isBookmarking, setIsBookmarking] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((prev) => !prev);
      setOptmisticLikes((prev) => prev + (hasLiked ? -1 : 1));
      await toggleLike(post.id);
    } catch (error) {
      setOptmisticLikes(post._count.likes);
      setHasLiked(post.likes.some((like) => like.userId === dbUserId));
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;

    try {
      setIsBookmarking(true);

      setHasBookmarked((prev) => !prev);

      const res = await toggleBookmark(post.id);

      if (!res?.success) {
        setHasBookmarked(
          post.bookmarks.some((bookmark) => bookmark.userId === dbUserId),
        );
      }
    } catch (error) {
      setHasBookmarked(
        post.bookmarks.some((bookmark) => bookmark.userId === dbUserId),
      );
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleRepost = async () => {
    if (isReposting) return;

    try {
      setIsReposting(true);

      const res = await repostPost(post.id);

      if (res?.success) {
        toast.success("Post reposted");
      } else {
        toast.error(res?.error || "Failed to repost");
      }
    } catch (error) {
      toast.error("Failed to repost");
    } finally {
      setIsReposting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const result = await createComment(post.id, newComment);
      if (result?.success) {
        toast.success("Comment posted successfully");
        setNewComment("");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      if (result.success) toast.success("Post deleted successfully");
      else throw new Error(result.error);
    } catch (error) {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AnimatedContainer direction="up" delay={0.05} className="mb-4">
      <GlassPanel hoverable className="p-0 overflow-hidden">
        <div className="p-4 space-y-3.5">
          <div className="flex space-x-3">
            <Link href={`/profile/${post.author.username}`}>
              <Avatar className="size-9 border border-border/40 hover:opacity-90 transition-opacity">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
              </Avatar>
            </Link>

            {/* POST HEADER & TEXT CONTENT */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <Link
                    href={`/profile/${post.author.username}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors text-sm truncate"
                  >
                    {post.author.name}
                  </Link>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="hover:underline"
                    >
                      @{post.author.username}
                    </Link>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>
                </div>
                {/* Check if current user is the post author */}
                {dbUserId === post.author.id && (
                  <DeleteAlertDialog
                    isDeleting={isDeleting}
                    onDelete={handleDeletePost}
                  />
                )}
              </div>
              <p className="mt-1.5 text-sm text-foreground/95 break-words leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
              {post.repostOf && (
                <div className="mb-3 rounded-xl border border-border/30 bg-secondary/20 p-3">
                  <div className="mb-2 text-xs text-muted-foreground">
                    Reposted from @{post.repostOf.author.username}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm whitespace-pre-wrap">
                      {post.repostOf.content}
                    </p>

                    <PostRenderer post={post.repostOf} dbUserId={dbUserId} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* POST IMAGES */}
          <PostRenderer post={post} dbUserId={dbUserId} />

          {/* LIKE & COMMENT BUTTONS */}
          <div className="flex items-center pt-2 space-x-2 border-t border-border/20">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                className={`text-muted-foreground gap-1.5 rounded-md hover:bg-red-500/10 cursor-pointer h-8 px-2.5 text-xs font-medium ${
                  hasLiked
                    ? "text-red-500 hover:text-red-600"
                    : "hover:text-red-500"
                }`}
                onClick={handleLike}
              >
                <motion.div
                  whileTap={{ scale: 1.25 }}
                  whileHover={{ scale: 1.03 }}
                >
                  <HeartIcon
                    className={`size-4 ${hasLiked ? "fill-current" : ""}`}
                  />
                </motion.div>
                <span className="text-xs">{optimisticLikes}</span>
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5 rounded-md hover:bg-red-500/10 cursor-pointer h-8 px-2.5 text-xs font-medium"
                >
                  <HeartIcon className="size-4" />
                  <span className="text-xs">{optimisticLikes}</span>
                </Button>
              </SignInButton>
            )}

            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 rounded-md hover:bg-blue-500/10 cursor-pointer h-8 px-2.5 text-xs font-medium ${
                showComments
                  ? "text-blue-500 hover:text-blue-600"
                  : "text-muted-foreground hover:text-blue-500"
              }`}
              onClick={() => setShowComments((prev) => !prev)}
            >
              <MessageCircleIcon
                className={`size-4 ${showComments ? "fill-blue-500/10" : ""}`}
              />
              <span className="text-xs">{post.comments.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`gap-1.5 rounded-md hover:bg-yellow-500/10 cursor-pointer h-8 px-2.5 text-xs font-medium ${
                hasBookmarked
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-muted-foreground hover:text-yellow-500"
              }`}
            >
              <BookmarkIcon
                className={`size-4 ${hasBookmarked ? "fill-current" : ""}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepost}
              className="gap-1.5 rounded-md hover:bg-green-500/10 cursor-pointer h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-green-500"
            >
              <Repeat2Icon className="size-4" />
            </Button>
          </div>

          {/* COMMENTS SECTION */}
          <AnimatePresence initial={false}>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pt-3 border-t border-border/30">
                  <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {/* DISPLAY COMMENTS */}
                    {post.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="flex space-x-2.5 group/comment p-1.5 rounded-md hover:bg-secondary/20 transition-colors duration-150"
                      >
                        <Avatar className="size-7 flex-shrink-0 border border-border/40">
                          <AvatarImage
                            src={comment.author.image ?? "/avatar.png"}
                          />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="font-semibold text-xs text-foreground">
                              {comment.author.name}
                            </span>
                            <span className="text-3xs text-muted-foreground">
                              @{comment.author.username}
                            </span>
                            <span className="text-3xs text-muted-foreground/60">
                              ·
                            </span>
                            <span className="text-3xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt))}{" "}
                              ago
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 mt-0.5 break-words leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {user ? (
                    <div className="flex space-x-3 pt-1">
                      <Avatar className="size-8 flex-shrink-0 border border-border/40">
                        <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[60px] resize-none text-xs rounded-md border border-border/45 focus-visible:ring-1 focus-visible:ring-ring/40 bg-secondary/10"
                        />
                        <div className="flex justify-end mt-1.5">
                          <GradientButton
                            size="sm"
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || isCommenting}
                            loading={isCommenting}
                          >
                            {!isCommenting && (
                              <>
                                <SendIcon className="size-3 mr-1.5" />
                                Comment
                              </>
                            )}
                            {isCommenting && "Posting..."}
                          </GradientButton>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center p-3 border border-border/30 rounded-md bg-secondary/15">
                      <SignInButton mode="modal">
                        <Button
                          variant="outline"
                          className="gap-2 rounded-md text-xs font-medium cursor-pointer"
                        >
                          <LogInIcon className="size-3.5" />
                          Sign in to comment
                        </Button>
                      </SignInButton>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlassPanel>
    </AnimatedContainer>
  );
}
export default PostCard;
