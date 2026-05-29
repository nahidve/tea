"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConversations } from "@/actions/message.action";
import { getPusherClient } from "@/lib/pusher-client";
import { usePathname } from "next/navigation";

type Conversation = Awaited<ReturnType<typeof getConversations>>[number];

export default function ConversationsList({ userId }: { userId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const pathname = usePathname();
  const activeConversationId = pathname.split("/").pop();

  useEffect(() => {
    const load = async () => {
      const data = await getConversations();
      setConversations(data);
    };

    load();
  }, []);

  /* REALTIME UPDATE */
  useEffect(() => {
    const pusher = getPusherClient();

    const channel = pusher.subscribe(`user-${userId}`);

    channel.bind("new-message", (message: any) => {
      setConversations((prev) => {
        const updated = [...prev];

        const index = updated.findIndex((c) => c.id === message.conversationId);

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            messages: [message, ...(updated[index].messages || [])],
          };
        }

        return updated;
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`user-${userId}`);
    };
  }, [userId]);

  return (
    <div className="h-full border-r border-border w-[320px] overflow-y-auto">
      <div className="p-4 font-semibold">Messages</div>

      <div className="space-y-1">
        {conversations.map((c) => {
          const other = c.participants.find((p) => p.user.id !== userId)?.user;

          const lastMessage = c.messages?.[0];

          const isActive = activeConversationId === c.id;

          const isUnread =
            lastMessage && lastMessage.senderId !== userId && !isActive;

          return (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className={`flex items-center gap-3 p-3 hover:bg-secondary/40 transition ${
                isActive ? "bg-secondary/50" : ""
              }`}
            >
              <img
                src={other?.image ?? "/avatar.png"}
                className="w-9 h-9 rounded-full"
              />

              <div className="min-w-0 flex-1">
                <div
                  className={`text-sm font-medium truncate ${
                    isUnread ? "font-bold text-foreground" : ""
                  }`}
                >
                  {other?.name}
                </div>

                <div
                  className={`text-xs truncate ${
                    isUnread ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {lastMessage?.content || "No messages yet"}
                </div>
              </div>

              {isUnread && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
