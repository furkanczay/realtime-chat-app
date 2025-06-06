import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { decryptMessage, generateRoomKey } from "@/lib/encryption";

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

  try {
    // Kullanıcının arkadaşlarını getir
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });

    // Sadece mesajlaşılan arkadaşları getir
    const friendsWithMessages = await Promise.all(
      friendships.map(async (friendship: any) => {
        const friend =
          friendship.user1Id === session.user.id
            ? friendship.user2
            : friendship.user1;

        // Bu arkadaşla olan son mesajı getir
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: session.user.id, receiverId: friend.id },
              { senderId: friend.id, receiverId: session.user.id },
            ],
          },
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: { username: true, name: true },
            },
          },
        });

        // Eğer hiç mesaj yoksa bu arkadaşı döndürme
        if (!lastMessage) {
          return null;
        }

        // Bu arkadaştan gelen okunmamış mesaj sayısını getir
        const unreadCount = await prisma.message.count({
          where: {
            senderId: friend.id,
            receiverId: session.user.id,
            isRead: false,
          },
        });

        let lastMessageText = "";
        let lastMessageTime = "";

        try {
          // Mesajı şifresini çöz
          const roomKey = generateRoomKey(session.user.id, friend.id);
          lastMessageText = decryptMessage(lastMessage.text, roomKey);
          lastMessageTime = lastMessage.createdAt.toISOString();

          // Mesaj çok uzunsa kısalt
          if (lastMessageText.length > 50) {
            lastMessageText = lastMessageText.substring(0, 50) + "...";
          }
        } catch (error) {
          console.error("Son mesaj şifresi çözülürken hata:", error);
          lastMessageText = "Mesaj okunamadı";
        }

        return {
          ...friend,
          unreadCount,
          lastMessage: lastMessageText,
          lastMessageTime,
        };
      })
    );

    // Null değerleri filtrele ve zamana göre sırala
    const filteredFriends = friendsWithMessages
      .filter((friend) => friend !== null)
      .sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return (
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
        );
      });

    return NextResponse.json({
      success: true,
      data: filteredFriends,
    });
  } catch (error) {
    console.error("Mesajlaşılan arkadaşlar getirilirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Arkadaşlar getirilemedi",
      },
      { status: 500 }
    );
  }
}
