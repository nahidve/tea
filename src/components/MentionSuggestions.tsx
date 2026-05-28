"use client";

import { Avatar, AvatarImage } from "./ui/avatar";

interface User {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
}

interface Props {
  users: User[];
  onSelect: (username: string) => void;
}

function MentionSuggestions({ users, onSelect }: Props) {
  if (users.length === 0) return null;

  return (
    <div className="absolute z-50 mt-2 w-full rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user.username)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.image || "/avatar.png"} />
          </Avatar>

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>

            <p className="text-xs text-muted-foreground truncate">
              @{user.username}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default MentionSuggestions;
