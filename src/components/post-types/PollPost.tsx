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
  dbUserId: string | null;
}

function PollPost({ poll, dbUserId }: PollPostProps) {
  const userVote =
    poll.options.find((opt) => opt.votes.some((v) => v.userId === dbUserId))
      ?.id || null;

  const [loading, setLoading] = useState(false);

  const [optimisticVote, setOptimisticVote] = useState<string | null>(userVote);

  const [optimisticOptions, setOptimisticOptions] = useState(
    poll.options.map((opt) => ({
      ...opt,
      voteCount: opt.votes.length,
    })),
  );

  const totalVotes = optimisticOptions.reduce(
    (acc, opt) => acc + opt.voteCount,
    0,
  );

  const handleVote = async (optionId: string) => {
    if (loading || optimisticVote) return;

    setLoading(true);
    setOptimisticVote(optionId);

    setOptimisticOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        voteCount: opt.id === optionId ? opt.voteCount + 1 : opt.voteCount,
      })),
    );

    const res = await votePoll(optionId);

    if (!res?.success) {
      setOptimisticVote(userVote || null);

      setOptimisticOptions(
        poll.options.map((opt) => ({
          ...opt,
          voteCount: opt.votes.length,
        })),
      );
    }

    setLoading(false);
  };

  return (
    <div className="border border-border/30 rounded-md p-3 space-y-3 bg-secondary/10">
      <p className="font-medium text-sm">{poll.question}</p>

      <div className="space-y-2">
        {optimisticOptions.map((opt) => {
          const percent =
            totalVotes === 0 ? 0 : (opt.voteCount / totalVotes) * 100;

          return (
            <button
              key={opt.id}
              disabled={loading || !!optimisticVote}
              onClick={() => handleVote(opt.id)}
              className={`relative w-full overflow-hidden text-left border rounded-md px-3 py-2 text-sm transition ${
                optimisticVote === opt.id
                  ? "border-primary bg-primary/5"
                  : "border-border/20 hover:bg-secondary/30"
              }`}
            >
              <div
                className="absolute left-0 top-0 h-full bg-primary/10 transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />

              <div className="relative flex justify-between items-center">
                <span>{opt.text}</span>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{opt.voteCount} votes</span>
                  <span>{Math.round(percent)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">{totalVotes} total votes</p>
    </div>
  );
}

export default PollPost;
