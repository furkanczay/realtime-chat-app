// Mesajları okundu olarak işaretle
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user.id) {
      return NextResponse.json(
        { success: false, message: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { userId } = await params;

    const otherUserId = userId;

    // Bu kullanıcıdan gelen tüm okunmamış mesajları okundu olarak işaretle
    const updatedMessages = await prisma.message.updateMany({
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
      message: "Mesajlar okundu olarak işaretlendi",
      updatedCount: updatedMessages.count,
    });
  } catch (error) {
    console.error("Mesajları okundu işaretleme hatası:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
