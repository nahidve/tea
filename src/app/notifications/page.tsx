import { getNotifications } from "@/actions/notification.action";
import { getDbUserId } from "@/actions/user.action";
import NotificationsClient from "@/components/NotificationsClient";

export default async function NotificationsPage() {
  const userId = await getDbUserId();
  if (!userId) return null;

  const notifications = await getNotifications();

  return (
    <NotificationsClient initialNotifications={notifications} userId={userId} />
  );
}
