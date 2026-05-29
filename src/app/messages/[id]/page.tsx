import {
  getConversationMessages,
  getConversations,
} from "@/actions/message.action";

import { getDbUserId } from "@/actions/user.action";

import ChatClient from "@/components/ChatClient";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MessagePage({ params }: Props) {
  const { id } = await params;

  const userId = await getDbUserId();

  if (!userId) return null;

  const messages = await getConversationMessages(id);

  const conversations = await getConversations();

  const conversation = conversations.find((c) => c.id === id);

  if (!conversation) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Conversation not found
      </div>
    );
  }

  const otherUser = conversation.participants.find(
    (p) => p.user.id !== userId,
  )?.user;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* HEADER */}

      <div className="border-b border-border px-5 py-4">
        <div className="font-semibold">{otherUser?.name}</div>

        <div className="text-xs text-muted-foreground">
          @{otherUser?.username}
        </div>
      </div>

      {/* CHAT */}

      <div className="flex-1 min-h-0">
        <ChatClient
          conversationId={id}
          currentUserId={userId}
          initialMessages={messages}
        />
      </div>
    </div>
  );
}
