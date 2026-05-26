"use client";

import { useState } from "react";
import { votePoll } from "@/actions/poll.action";

interface PollPostProps {
  poll: {
    id: string;
    question: string;
    options: {
      id: string;
      text: string;
      votes: { userId: string }[];
    }[];
  };
  userVote?: string; // optionId
}

function PollPost({
  poll,
  dbUserId,
}: {
  poll: {
    id: string;
    question: string;
    options: {
      id: string;
      text: string;
      votes: { userId: string }[];
    }[];
  };
  dbUserId: string | null;
}) {
  const userVote =
    poll.options.find((opt) => opt.votes.some((v) => v.userId === dbUserId))
      ?.id || null;
  const [loading, setLoading] = useState(false);
  const [optimisticVote, setOptimisticVote] = useState<string | null>(userVote);

  const totalVotes = poll.options.reduce(
    (acc, opt) => acc + opt.votes.length,
    0,
  );

  const handleVote = async (optionId: string) => {
    if (loading) return;

    setLoading(true);
    setOptimisticVote(optionId);

    const res = await votePoll(optionId);

    if (!res?.success) {
      setOptimisticVote(userVote || null); // rollback
    }

    setLoading(false);
  };

  return (
    <div className="border border-border/30 rounded-md p-3 space-y-3 bg-secondary/10">
      <p className="font-medium text-sm">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const percent =
            totalVotes === 0 ? 0 : (opt.votes.length / totalVotes) * 100;

          return (
            <button
              key={opt.id}
              disabled={loading || !!optimisticVote}
              onClick={() => handleVote(opt.id)}
              className={`relative w-full text-left border rounded-md px-3 py-2 text-sm transition ${
                optimisticVote === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border/20 hover:bg-secondary/30"
              }`}
            >
              <div
                className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-300"
                style={{ width: `${percent}%` }}
              />

              <div className="relative flex justify-between">
                <span>{opt.text}</span>
                <span className="text-xs text-muted-foreground">
                  {opt.votes.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">{totalVotes} votes</p>
    </div>
  );
}

export default PollPost;
