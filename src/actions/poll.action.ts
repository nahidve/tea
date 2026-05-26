"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function votePoll(optionId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    // ensure user votes only once per poll
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: true },
    });

    if (!option) throw new Error("Option not found");

    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId,
        option: {
          pollId: option.pollId,
        },
      },
      include: {
        option: true,
      },
    });

    if (existingVote) {
      // optional: allow switch vote
      await prisma.pollVote.delete({
        where: { id: existingVote.id },
      });
    }

    await prisma.pollVote.create({
      data: {
        userId,
        optionId,
      },
    });
    return {
      success: true,
      votedOptionId: optionId,
    };
  } catch (e) {
    console.error(e);
    return { success: false };
  }
}
