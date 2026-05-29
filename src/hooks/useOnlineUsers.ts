"use client";

import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { useUser } from "@clerk/nextjs";

export function useOnlineUsers() {
  const { user } = useUser();

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const pusher = getPusherClient();

    const channel = pusher.subscribe("presence-online-users");

    channel.bind("pusher:subscription_succeeded", (members: any) => {
      const users: string[] = [];

      members.each((member: any) => {
        users.push(member.id);
      });

      console.log("ONLINE USERS:", users);

      setOnlineUsers(users);
    });

    channel.bind("pusher:member_added", (member: any) => {
      console.log("USER JOINED:", member.id);

      setOnlineUsers((prev) => [...new Set([...prev, member.id])]);
    });

    channel.bind("pusher:member_removed", (member: any) => {
      console.log("USER LEFT:", member.id);

      setOnlineUsers((prev) => prev.filter((id) => id !== member.id));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("presence-online-users");
    };
  }, [user?.id]);

  return onlineUsers;
}
