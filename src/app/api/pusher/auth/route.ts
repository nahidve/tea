import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIND DATABASE USER
    const dbUser = await prisma.user.findUnique({
      where: {
        clerkId,
      },

      select: {
        id: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();

    const socketId = formData.get("socket_id") as string;

    const channel = formData.get("channel_name") as string;

    const authResponse = pusherServer.authorizeChannel(socketId, channel, {
      user_id: dbUser.id, // IMPORTANT
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
