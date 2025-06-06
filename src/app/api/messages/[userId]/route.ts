import { getSession } from "@/actions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
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
    const otherUserId = parseInt(params.userId);

    if (isNaN(otherUserId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz kullanıcı ID'si",
        },
        { status: 400 }
      );
    }

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
          { user1Id: session.userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: session.userId },
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
          { senderId: session.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.userId },
        ],
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

    // Mesajları okundu olarak işaretle (sadece kendisine gelenler)
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: session.userId,
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
