interface NotificationData {
  type: string;
  creator: {
    name: string | null;
    username: string;
  };
  post?: {
    content: string | null;
  } | null;
}

export function getNotificationText(notification: NotificationData) {
  const name = notification.creator.name || notification.creator.username;

  switch (notification.type) {
    case "LIKE":
      return `${name} liked your post`;

    case "COMMENT":
      return `${name} commented on your post`;

    case "FOLLOW":
      return `${name} followed you`;

    case "REPOST":
      return `${name} reposted your post`;

    case "MENTION":
      return `${name} mentioned you in a post`;

    default:
      return "New notification";
  }
}

export function getNotificationPreview(notification: NotificationData) {
  return notification.post?.content || null;
}

import { pusherServer } from "./pusher";
export async function sendNotification(userId: string, payload: any) {
  await pusherServer.trigger(`user-${userId}`, "notification", payload);
}
