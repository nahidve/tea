"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { pusherServer } from "@/lib/pusher";

/* ----------------------------------------
   CREATE OR GET CONVERSATION
----------------------------------------- */
export async function getOrCreateConversation(otherUserId: string) {
  const userId = await getDbUserId();

  if (!userId) throw new Error("Unauthorized");

  // check existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: {
            in: [userId, otherUserId],
          },
        },
      },
    },

    include: {
      participants: true,
    },
  });

  if (existing && existing.participants.length === 2) {
    return existing;
  }

  // create new conversation
  return prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId }, { userId: otherUserId }],
      },
    },
  });
}

/* ----------------------------------------
   SEND MESSAGE
----------------------------------------- */
export async function sendMessage(conversationId: string, content: string) {
  try {
    const senderId = await getDbUserId();

    if (!senderId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (!content.trim()) {
      return {
        success: false,
        error: "Empty message",
      };
    }

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId,
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        updatedAt: new Date(),
      },
    });

    /* REALTIME PUSH */

    await pusherServer.trigger(
      `conversation-${conversationId}`,
      "new-message",
      message,
    );

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);

    return {
      success: false,
      error: "Failed to send message",
    };
  }
}

export async function sendTyping(conversationId: string) {
  const userId = await getDbUserId();

  if (!userId) return;

  await pusherServer.trigger(`conversation-${conversationId}`, "typing", {
    userId,
  });
}

/* ----------------------------------------
   GET CONVERSATIONS
----------------------------------------- */
export async function getConversations() {
  const userId = await getDbUserId();

  if (!userId) throw new Error("Unauthorized");

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },

    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      },

      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },

        include: {
          sender: {
            select: {
              username: true,
            },
          },
        },
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return conversations;
}

export async function getConversationMessages(conversationId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },

      orderBy: {
        createdAt: "asc",
      },

      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return messages;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

/* ----------------------------------------
   GET MESSAGES
----------------------------------------- */
export async function getMessages(conversationId: string) {
  const userId = await getDbUserId();

  if (!userId) throw new Error("Unauthorized");

  return prisma.message.findMany({
    where: {
      conversationId,
    },

    include: {
      sender: {
        select: {
          id: true,
          username: true,
          image: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });
}
