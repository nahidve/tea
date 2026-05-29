"use client";

import { sendMessage } from "@/actions/message.action";
import { getPusherClient } from "@/lib/pusher-client";
import { formatDistanceToNow } from "date-fns";
import { SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string | Date;

  sender: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
};

type ChatClientProps = {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
};

export default function ChatClient({
  conversationId,
  currentUserId,
  initialMessages,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [newMessage, setNewMessage] = useState("");

  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* AUTO SCROLL */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* PUSHER REALTIME */

  useEffect(() => {
    const pusher = getPusherClient();

    const channel = pusher.subscribe(`conversation-${conversationId}`);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);

        if (exists) return prev;

        return [...prev, message];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  /* SEND */

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      setIsSending(true);

      const result = await sendMessage(conversationId, newMessage);

      if (!result.success) return;

      setNewMessage("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* MESSAGES */}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => {
          const isOwn = message.sender.id === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isOwn ? "bg-primary text-primary-foreground" : "bg-secondary"
                }`}
              >
                {!isOwn && (
                  <div className="text-xs font-semibold mb-1 opacity-80">
                    {message.sender.name || message.sender.username}
                  </div>
                )}

                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                <div className="text-[10px] opacity-60 mt-1">
                  {formatDistanceToNow(new Date(message.createdAt))} ago
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}

      <div className="border-t border-border p-3 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-secondary rounded-xl px-4 py-2 text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          disabled={isSending}
          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
        >
          <SendIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}
