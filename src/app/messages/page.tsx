import { getDbUserId } from "@/actions/user.action";
import ConversationsList from "@/components/ConversationsList";

export default async function MessagesPage() {
  const userId = await getDbUserId();

  if (!userId) return null;

  return (
    <div className="h-[calc(100vh-5rem)] flex">
      <ConversationsList userId={userId} />

      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a conversation
      </div>
    </div>
  );
}
