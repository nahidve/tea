"use client";

import { searchUsers } from "@/actions/user.action";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

type User = Awaited<ReturnType<typeof searchUsers>>[number];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const [users, setUsers] = useState<User[]>([]);

  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 1) {
      setUsers([]);
      return;
    }

    const results = await searchUsers(value);

    setUsers(results);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Input
        placeholder="Search users..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="space-y-2">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition"
          >
            <img
              src={user.image ?? "/avatar.png"}
              className="w-10 h-10 rounded-full"
            />

            <div>
              <div className="font-medium text-sm">{user.name}</div>

              <div className="text-xs text-muted-foreground">
                @{user.username}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
