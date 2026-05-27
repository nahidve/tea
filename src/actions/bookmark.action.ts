"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(postId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) {
      return { success: false };
    }

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      revalidatePath("/");

      return {
        success: true,
        bookmarked: false,
      };
    }

    await prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      bookmarked: true,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
    };
  }
}

export async function getBookmarkedPosts() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        post: {
          include: {
            repostOf: {
              include: {
                poll: {
                  include: {
                    options: {
                      include: {
                        votes: {
                          select: {
                            userId: true,
                          },
                        },
                      },
                    },
                  },
                },

                gif: true,

                images: {
                  orderBy: {
                    order: "asc",
                  },
                },

                bookmarks: {
                  select: {
                    userId: true,
                  },
                },

                likes: {
                  select: {
                    userId: true,
                  },
                },

                comments: {
                  include: {
                    author: {
                      select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                      },
                    },
                  },

                  orderBy: {
                    createdAt: "asc",
                  },
                },

                author: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },

                _count: {
                  select: {
                    likes: true,
                    comments: true,
                  },
                },
              },
            },

            poll: {
              include: {
                options: {
                  include: {
                    votes: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                },
              },
            },

            gif: true,

            images: {
              orderBy: {
                order: "asc",
              },
            },

            bookmarks: {
              select: {
                userId: true,
              },
            },

            likes: {
              select: {
                userId: true,
              },
            },

            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                  },
                },
              },

              orderBy: {
                createdAt: "asc",
              },
            },

            author: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },

            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
      },
    });

    return bookmarks.map((bookmark) => bookmark.post);
  } catch (error) {
    console.error(error);

    return [];
  }
}
