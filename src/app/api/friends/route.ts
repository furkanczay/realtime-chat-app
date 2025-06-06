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

  try {
    // Kullanıcının arkadaşlarını getir
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: session.userId }, { user2Id: session.userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
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
            email: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    }); // Arkadaş listesini düzenle (kendisi hariç) - tüm arkadaşları döndür
    const friends = friendships.map((friendship: any) => {
      const friend =
        friendship.user1Id === session.userId
          ? friendship.user2
          : friendship.user1;

      return {
        ...friend,
        // Gerçek online durumu ve son görülme zamanı
      };
    });

    return NextResponse.json({
      success: true,
      data: friends,
    });
  } catch (error) {
    console.error("Arkadaşlar getirilirken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Arkadaşlar getirilemedi",
      },
      { status: 500 }
    );
  }
}
