"use client";

import { useOnlineUsers } from "@/hooks/useOnlineUsers";

export default function OnlineIndicator({ userId }: { userId: string }) {
  const onlineUsers = useOnlineUsers();

  console.log("CHECK USER:", userId);
  console.log("ONLINE:", onlineUsers);

  if (!onlineUsers.includes(userId)) return null;

  return (
    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background z-50" />
  );
}
