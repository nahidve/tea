"use client";

import { markNotificationsAsRead } from "@/actions/notification.action";
import {
  getNotificationText,
  getNotificationPreview,
} from "@/lib/notifications";
import { getPusherClient } from "@/lib/pusher-client";

import { useEffect, useState } from "react";

import { formatDistanceToNow } from "date-fns";

import { toast } from "sonner";

import { motion, AnimatePresence } from "framer-motion";

import OnlineIndicator from "./OnlineIndicator";

import {
  HeartIcon,
  MessageCircleIcon,
  UserPlusIcon,
  Repeat2Icon,
  AtSignIcon,
} from "lucide-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area";

import GlassPanel from "@/components/ui/custom/GlassPanel";

import AnimatedContainer from "@/components/ui/custom/AnimatedContainer";

type Notification = {
  id: string;
  type: string;
  read: boolean;

  createdAt: string | Date;

  creator: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };

  post: {
    id: string;
    content: string | null;

    gif?: {
      gifUrl: string;
    } | null;

    images?: {
      url: string;
    }[];
  } | null;

  comment?: {
    id: string;
    content: string;
  } | null;
};

type Props = {
  initialNotifications: Notification[];
  userId: string;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return (
        <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
          <HeartIcon className="size-3.5 fill-current" />
        </div>
      );

    case "COMMENT":
      return (
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
          <MessageCircleIcon className="size-3.5 fill-current" />
        </div>
      );

    case "FOLLOW":
      return (
        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
          <UserPlusIcon className="size-3.5" />
        </div>
      );

    case "REPOST":
      return (
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
          <Repeat2Icon className="size-3.5" />
        </div>
      );

    case "MENTION":
      return (
        <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-500">
          <AtSignIcon className="size-3.5" />
        </div>
      );

    default:
      return null;
  }
};

export default function NotificationsClient({
  initialNotifications,
  userId,
}: Props) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  useEffect(() => {
    console.log("NotificationsClient mounted");

    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length > 0) {
      markNotificationsAsRead(unreadIds);
    }
  }, []);

  useEffect(() => {
    console.log("USER ID FROM CLIENT:", userId);

    const pusher = getPusherClient();

    pusher.connection.bind("connected", () => {
      console.log("PUSHER CONNECTED");
    });

    pusher.connection.bind("error", (err: any) => {
      console.log("PUSHER ERROR:", err);
    });

    const channelName = `user-${userId}`;

    console.log("SUB CHANNEL:", channelName);

    const channel = pusher.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("SUBSCRIBED SUCCESSFULLY");
    });

    channel.bind("notification", (data: Notification) => {
      console.log("RECEIVED NOTIFICATION:", data);

      setNotifications((prev) => [
        {
          ...data,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);

      toast.success(getNotificationText(data));
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatedContainer direction="up" delay={0.05} className="space-y-3">
      <GlassPanel className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/10">
          <h1 className="text-md font-bold tracking-tight text-gradient">
            Notifications
          </h1>

          <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {unreadCount} unread
          </span>
        </div>

        <ScrollArea className="h-[calc(100vh-14rem)]">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground/80">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border/25">
              <AnimatePresence initial={false}>
                {notifications.map((notification, idx) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.18,
                      delay: idx * 0.02,
                    }}
                    className={`flex items-start gap-3 p-3.5 transition-all duration-150 relative ${
                      !notification.read
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : "hover:bg-secondary/15"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="mt-0.5 border border-border/40 shrink-0 w-8 h-8">
                        <AvatarImage
                          src={notification.creator.image ?? "/avatar.png"}
                        />
                      </Avatar>

                      <OnlineIndicator userId={notification.creator.id} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getNotificationIcon(notification.type)}

                        <span className="text-xs text-foreground/90 leading-relaxed">
                          {getNotificationText(notification)}
                        </span>

                        {!notification.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      {notification.post && (
                        <div className="pl-7 space-y-1.5">
                          <div className="text-xs text-muted-foreground/90 rounded-md p-2 bg-secondary/20 border border-border/30 max-w-full">
                            <p className="line-clamp-2 leading-relaxed">
                              {getNotificationPreview(notification) ||
                                "Shared a post"}
                            </p>

                            {((notification.post.images &&
                              notification.post.images.length > 0) ||
                              notification.post.gif) && (
                              <div className="mt-1.5 rounded-md overflow-hidden border border-border/30 max-w-[160px]">
                                <img
                                  src={
                                    notification.post.gif?.gifUrl ||
                                    notification.post.images?.[0]?.url
                                  }
                                  alt="Post preview"
                                  className="w-full h-auto object-cover max-h-[100px]"
                                />
                              </div>
                            )}
                          </div>

                          {notification.type === "COMMENT" &&
                            notification.comment && (
                              <div className="text-xs p-2 bg-primary/5 border border-primary/10 rounded-md text-foreground font-medium leading-relaxed">
                                {notification.comment.content}
                              </div>
                            )}
                        </div>
                      )}

                      <p className="text-3xs text-muted-foreground pl-7">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </GlassPanel>
    </AnimatedContainer>
  );
}
