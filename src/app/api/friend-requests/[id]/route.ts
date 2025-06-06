import { getSession } from "@/actions";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    const requestId = parseInt(params.id);
    const { action } = await request.json();

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Geçersiz aksiyon",
        },
        { status: 400 }
      );
    }

    // İsteği bul ve kontrol et
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!friendRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "İstek bulunamadı",
        },
        { status: 404 }
      );
    }

    // Sadece alıcı yanıtlayabilir
    if (friendRequest.receiverId !== session.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bu isteği yanıtlama yetkiniz yok",
        },
        { status: 403 }
      );
    }

    // İstek zaten işlenmiş mi kontrol et
    if (friendRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: "Bu istek zaten işlenmiş",
        },
        { status: 400 }
      );
    }

    if (action === "accept") {
      // Transaction kullanarak hem isteği güncelle hem arkadaşlık oluştur
      await prisma.$transaction([
        // İsteği kabul edildi olarak işaretle
        prisma.friendRequest.update({
          where: { id: requestId },
          data: { status: "ACCEPTED" },
        }),
        // Arkadaşlık oluştur
        prisma.friendship.create({
          data: {
            user1Id: Math.min(friendRequest.senderId, friendRequest.receiverId),
            user2Id: Math.max(friendRequest.senderId, friendRequest.receiverId),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: "Arkadaşlık isteği kabul edildi",
      });
    } else {
      // İsteği reddet
      await prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });

      return NextResponse.json({
        success: true,
        message: "Arkadaşlık isteği reddedildi",
      });
    }
  } catch (error) {
    console.error("Arkadaşlık isteği yanıtlanırken hata:", error);
    return NextResponse.json(
      {
        success: false,
        message: "İstek yanıtlanamadı",
      },
      { status: 500 }
    );
  }
}
