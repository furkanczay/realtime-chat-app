import { getSession } from "@/actions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        success: false,
        message: "Arama terimi en az 2 karakter olmalıdır",
      },
      { status: 400 }
    );
  }

  try {
    // Kullanıcıları ara (kendisi hariç)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: session.userId } },
          {
            OR: [
              { username: { contains: query } },
              { email: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
      },
      take: 10,
    });

    // Zaten arkadaş olanları ve bekleyen istekleri filtrele
    const existingConnections = await prisma.$transaction([
      // Arkadaşlıkları kontrol et
      prisma.friendship.findMany({
        where: {
          OR: [
            {
              user1Id: session.userId,
              user2Id: { in: users.map((u) => u.id) },
            },
            {
              user2Id: session.userId,
              user1Id: { in: users.map((u) => u.id) },
            },
          ],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      }),
      // Bekleyen istekleri kontrol et
      prisma.friendRequest.findMany({
        where: {
          OR: [
            {
              senderId: session.userId,
              receiverId: { in: users.map((u) => u.id) },
            },
            {
              receiverId: session.userId,
              senderId: { in: users.map((u) => u.id) },
            },
          ],
          status: "PENDING",
        },
        select: {
          senderId: true,
          receiverId: true,
        },
      }),
    ]);

    const [friendships, pendingRequests] = existingConnections;

    // Zaten bağlantısı olan kullanıcıları filtrele
    const connectedUserIds = new Set([
      ...friendships.flatMap((f) => [f.user1Id, f.user2Id]),
      ...pendingRequests.flatMap((r) => [r.senderId, r.receiverId]),
    ]);

    const availableUsers = users.filter(
      (user) => !connectedUserIds.has(user.id)
    );

    return NextResponse.json({
      success: true,
      data: availableUsers,
    });
  } catch (error) {
    console.error("Kullanıcı arama hatası:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Arama yapılırken hata oluştu",
      },
      { status: 500 }
    );
  }
}
