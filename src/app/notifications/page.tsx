"use client";

import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import GlassPanel from "@/components/ui/custom/GlassPanel";
import AnimatedContainer from "@/components/ui/custom/AnimatedContainer";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type Notification = Notifications[number];

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
    default:
      return null;
  }
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await getNotifications();
        setNotifications(data);

        const unreadIds = data.filter((n) => !n.read).map((n) => n.id);
        if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);
      } catch (error) {
        toast.error("Failed to fetch notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) return <NotificationsSkeleton />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatedContainer direction="up" delay={0.05} className="space-y-3">
      <GlassPanel className="p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-secondary/10">
          <h1 className="text-md font-bold tracking-tight text-gradient">Notifications</h1>
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
                    transition={{ duration: 0.18, delay: idx * 0.02 }}
                    className={`flex items-start gap-3 p-3.5 transition-all duration-150 relative ${
                      !notification.read 
                        ? "bg-primary/5 border-l-2 border-l-primary" 
                        : "hover:bg-secondary/15"
                    }`}
                  >
                    <Avatar className="mt-0.5 border border-border/40 shrink-0 w-8 h-8">
                      <AvatarImage
                        src={notification.creator.image ?? "/avatar.png"}
                      />
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getNotificationIcon(notification.type)}
                        <span className="text-xs text-foreground/90">
                          <span className="font-semibold text-foreground">
                            {notification.creator.name ?? notification.creator.username}
                          </span>{" "}
                          {notification.type === "FOLLOW"
                            ? "started following you"
                            : notification.type === "LIKE"
                              ? "liked your post"
                              : "commented on your post"}
                        </span>
                        {!notification.read && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>

                      {notification.post &&
                        (notification.type === "LIKE" ||
                          notification.type === "COMMENT") && (
                          <div className="pl-7 space-y-1.5">
                            <div className="text-xs text-muted-foreground/90 rounded-md p-2 bg-secondary/20 border border-border/30 max-w-full">
                              <p className="line-clamp-2 leading-relaxed">{notification.post.content}</p>
                              {notification.post.image && (
                                <div className="mt-1.5 rounded-md overflow-hidden border border-border/30 max-w-[160px]">
                                  <img
                                    src={notification.post.image}
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

export default NotificationsPage;
