"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageCircleIcon } from "lucide-react";

import AnimatedContainer from "@/components/ui/custom/AnimatedContainer";
import GlassPanel from "@/components/ui/custom/GlassPanel";

type Conversation = {
  id: string;
  createdAt: Date | string;

  participants: {
    user: {
      id: string;
      username: string;
      name: string | null;
      image: string | null;
    };
  }[];

  messages: {
    id: string;
    content: string;
    createdAt: Date | string;

    sender: {
      username: string;
    };
  }[];
};

export default function MessagesClient({
  conversations,
}: {
  conversations: Conversation[];
}) {
  return (
    <AnimatedContainer direction="up" delay={0.05}>
      <GlassPanel className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="size-5 text-primary" />

            <h1 className="font-bold text-lg">Messages</h1>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {conversations.map((conversation) => {
              const otherUser = conversation.participants[0]?.user;

              const lastMessage = conversation.messages[0];

              if (!otherUser) return null;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-secondary/20 transition-colors"
                >
                  <img
                    src={otherUser.image || "/avatar.png"}
                    alt={otherUser.username}
                    className="size-12 rounded-full object-cover border border-border/40"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate">
                        <p className="font-semibold text-sm truncate">
                          {otherUser.name || otherUser.username}
                        </p>

                        <p className="text-xs text-muted-foreground truncate">
                          @{otherUser.username}
                        </p>
                      </div>

                      {lastMessage && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(lastMessage.createdAt))}{" "}
                          ago
                        </span>
                      )}
                    </div>

                    {lastMessage && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        <span className="font-medium">
                          {lastMessage.sender.username === otherUser.username
                            ? ""
                            : "You: "}
                        </span>

                        {lastMessage.content}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </AnimatedContainer>
  );
}
