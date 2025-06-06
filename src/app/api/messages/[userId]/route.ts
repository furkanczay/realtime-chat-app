import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

  try {
    const { userId } = await params;
    const otherUserId = userId;

    // Kullanıcının var olup olmadığını kontrol et
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Kullanıcı bulunamadı",
        },
        { status: 404 }
      );
    }

    // Arkadaş olup olmadığını kontrol et
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: session.user.id },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu kullanıcıyla arkadaş değilsiniz",
        },
        { status: 403 }
      );
    }

    // İki kullanıcı arasındaki mesajları getir
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Mesajları okundu olarak işaretle (sadece kendisine gelenler)
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Konuşma getirilirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Konuşma getirilemedi",
      },
      { status: 500 }
    );
  }
}
