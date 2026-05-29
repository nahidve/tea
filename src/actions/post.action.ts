"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher";

/* -----------------------------
   CREATE POST
------------------------------ */
export async function createPost(
  content: string,
  images: string[],
  gif?: { gifUrl: string; previewUrl?: string } | null,
  poll?: { question: string; options: string[] } | null,
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const mentions = content.match(/@([a-zA-Z0-9_]+)/g) || [];
    const usernames = mentions.map((m) => m.slice(1).toLowerCase());

    let createdPost: any;
    let mentionedUserIds: string[] = [];

    await prisma.$transaction(async (tx) => {
      /* 1. Create post */
      const newPost = await tx.post.create({
        data: {
          content,
          authorId: userId,
          type: poll
            ? "POLL"
            : gif
              ? "GIF"
              : images.length > 1
                ? "CAROUSEL"
                : images.length === 1
                  ? "IMAGE"
                  : "TEXT",
        },
      });

      createdPost = newPost;

      /* 2. Resolve mentions */
      const mentionedUsers = await tx.user.findMany({
        where: {
          username: { in: usernames },
        },
        select: { id: true },
      });

      mentionedUserIds = mentionedUsers
        .filter((u) => u.id !== userId)
        .map((u) => u.id);

      /* 3. Create notifications */
      if (mentionedUserIds.length > 0) {
        await tx.notification.createMany({
          data: mentionedUserIds.map((id) => ({
            type: "MENTION",
            userId: id,
            creatorId: userId,
            postId: newPost.id,
          })),
        });
      }

      /* 4. Images */
      if (images.length > 0) {
        await tx.postImage.createMany({
          data: images.map((url, index) => ({
            postId: newPost.id,
            url,
            order: index,
          })),
        });
      }

      /* 5. GIF */
      if (gif) {
        await tx.gif.create({
          data: {
            postId: newPost.id,
            gifUrl: gif.gifUrl,
            previewUrl: gif.previewUrl,
          },
        });
      }

      /* 6. Poll */
      if (poll) {
        const pollRecord = await tx.poll.create({
          data: {
            postId: newPost.id,
            question: poll.question,
          },
        });

        await tx.pollOption.createMany({
          data: poll.options.map((text) => ({
            pollId: pollRecord.id,
            text,
          })),
        });
      }
    });

    /* -----------------------------
       REALTIME PUSH (PUSHER)
       OUTSIDE TRANSACTION
    ------------------------------ */
    if (mentionedUserIds.length > 0) {
      const creator = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      });

      await Promise.all(
        mentionedUserIds.map((id) =>
          pusherServer.trigger(`user-${id}`, "notification", {
            id: crypto.randomUUID(),
            type: "MENTION",
            createdAt: new Date().toISOString(),
            read: false,

            creator,

            post: {
              id: createdPost.id,
              content: createdPost.content,
              images: [],
              gif: null,
            },

            comment: null,
          }),
        ),
      );
    }

    revalidatePath("/");
    return { success: true, post: createdPost };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

/* -----------------------------
   GET POSTS
------------------------------ */
export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        repostOf: {
          include: {
            poll: {
              include: {
                options: {
                  include: {
                    votes: { select: { userId: true } },
                  },
                },
              },
            },
            gif: true,
            images: { orderBy: { order: "asc" } },
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
            likes: { select: { userId: true } },
            bookmarks: { select: { userId: true } },
            _count: { select: { likes: true, comments: true } },
          },
        },
        poll: {
          include: {
            options: {
              include: {
                votes: { select: { userId: true } },
              },
            },
          },
        },
        gif: true,
        images: { orderBy: { order: "asc" } },
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    return posts;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

/* -----------------------------
   GET POST BY ID
------------------------------ */
export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        repostOf: {
          include: {
            repostOf: true,
            poll: {
              include: {
                options: {
                  include: {
                    votes: { select: { userId: true } },
                  },
                },
              },
            },
            gif: true,
            images: { orderBy: { order: "asc" } },
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                username: true,
              },
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    image: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
            likes: { select: { userId: true } },
            bookmarks: { select: { userId: true } },
            _count: {
              select: { likes: true, comments: true, reposts: true },
            },
          },
        },
        poll: {
          include: {
            options: {
              include: {
                votes: { select: { userId: true } },
              },
            },
          },
        },
        gif: true,
        images: { orderBy: { order: "asc" } },
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
      },
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Failed to fetch post");
  }
}

/* -----------------------------
   REPOST
------------------------------ */
export async function repostPost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const existing = await prisma.post.findFirst({
      where: {
        authorId: userId,
        repostOfId: postId,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Already reposted",
      };
    }

    const originalPost = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        authorId: true,
      },
    });

    if (!originalPost) {
      return {
        success: false,
        error: "Post not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.create({
        data: {
          authorId: userId,
          repostOfId: postId,
          type: "TEXT",
        },
      });

      if (originalPost.authorId !== userId) {
        const notification = await tx.notification.create({
          data: {
            type: "REPOST",
            userId: originalPost.authorId,
            creatorId: userId,
            postId,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            post: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        });

        await pusherServer.trigger(
          `user-${originalPost.authorId}`,
          "notification",
          notification,
        );
      }
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to repost:", error);

    return {
      success: false,
      error: "Failed to repost",
    };
  }
}
/* -----------------------------
   LIKE
------------------------------ */
export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return { success: true };
    }

    // LIKE + NOTIFICATION + PUSHER
    await prisma.$transaction(async (tx) => {
      await tx.like.create({
        data: {
          userId,
          postId,
        },
      });

      if (post.authorId !== userId) {
        const notification = await tx.notification.create({
          data: {
            type: "LIKE",
            userId: post.authorId,
            creatorId: userId,
            postId,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            post: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        });
        console.log("PUSHER TRIGGER →", post.authorId);

        await pusherServer.trigger(
          `user-${post.authorId}`,
          "notification",
          notification,
        );
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}
/* -----------------------------
   COMMENT
------------------------------ */
export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      if (post.authorId !== userId) {
        const notification = await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
            post: {
              select: {
                id: true,
                content: true,
              },
            },
            comment: {
              select: {
                id: true,
                content: true,
              },
            },
          },
        });

        await pusherServer.trigger(
          `user-${post.authorId}`,
          "notification",
          notification,
        );
      }

      return [newComment];
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

/* -----------------------------
   DELETE POST
------------------------------ */
export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({ where: { id: postId } });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}
