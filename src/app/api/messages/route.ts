import { getSession } from "@/actions";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "UNAUTHORIZED",
      },
      { status: 403 }
    );
  }

  // Kullanıcının tüm mesajlarını çek (gönderdiği ve aldığı)
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: session.userId }, { receiverId: session.userId }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: messages,
  });
}
