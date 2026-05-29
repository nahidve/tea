"use client";

import { getOrCreateConversation } from "@/actions/message.action";
import GradientButton from "./ui/custom/GradientButton";
import { MessageCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageButtonProps = {
  userId: string;
};

export default function MessageButton({ userId }: MessageButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleMessage = async () => {
    try {
      setLoading(true);

      const conversation = await getOrCreateConversation(userId);

      router.push(`/messages/${conversation.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientButton
      variant="secondary"
      className="px-4 py-2"
      onClick={handleMessage}
      disabled={loading}
      loading={loading}
    >
      {!loading && (
        <>
          <MessageCircleIcon className="size-3.5 mr-1.5" />
          Message
        </>
      )}
    </GradientButton>
  );
}
